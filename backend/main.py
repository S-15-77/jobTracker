import os
from datetime import datetime, timezone
from typing import Literal

from bson import ObjectId
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field, HttpUrl
from pymongo import ASCENDING, MongoClient, ReturnDocument

ApplicationStatus = Literal["Applied", "Interview", "Selected", "Rejected"]


class Referral(BaseModel):
    email: str = ""
    referred: bool = False


class ApplicationCreate(BaseModel):
    company: str = Field(min_length=1, max_length=160)
    role: str = Field(min_length=1, max_length=160)
    location: str = Field(default="Not specified", max_length=160)
    url: HttpUrl
    status: ApplicationStatus = "Applied"
    resume: str = Field(default="General resume", max_length=160)
    referral: Referral = Field(default_factory=Referral)


class ApplicationResponse(ApplicationCreate):
    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(alias="_id")
    applied_at: datetime = Field(alias="appliedAt")


class StatusUpdate(BaseModel):
    status: ApplicationStatus


def serialize_application(document: dict) -> dict:
    document["_id"] = str(document["_id"])
    document["url"] = str(document["url"])
    document["appliedAt"] = document.pop("applied_at", document.get("appliedAt"))
    return document


app = FastAPI(title="Applyly API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS", "http://localhost:3000"
        ).split(",")
        if origin.strip()
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH"],
    allow_headers=["Content-Type"],
)

mongo_client = MongoClient(os.environ["MONGODB_URI"])
database = mongo_client[os.getenv("MONGODB_DB", "application-tracker")]
applications = database.applications
applications.create_index([("applied_at", ASCENDING)])


@app.get("/api/health")
def health() -> dict[str, str]:
    mongo_client.admin.command("ping")
    return {"status": "ok"}


@app.get("/api/applications", response_model=list[ApplicationResponse])
def list_applications() -> list[dict]:
    return [
        serialize_application(document)
        for document in applications.find().sort("applied_at", -1)
    ]


@app.post(
    "/api/applications",
    response_model=ApplicationResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_application(application: ApplicationCreate) -> dict:
    document = application.model_dump()
    document["url"] = str(document["url"])
    document["applied_at"] = datetime.now(timezone.utc)
    result = applications.insert_one(document)
    created = applications.find_one({"_id": result.inserted_id})
    if created is None:
        raise HTTPException(status_code=500, detail="Application was not saved.")
    return serialize_application(created)


@app.patch("/api/applications/{application_id}", response_model=ApplicationResponse)
def update_application(application_id: str, update: StatusUpdate) -> dict:
    if not ObjectId.is_valid(application_id):
        raise HTTPException(status_code=400, detail="Invalid application id.")

    result = applications.find_one_and_update(
        {"_id": ObjectId(application_id)},
        {"$set": {"status": update.status}},
        return_document=ReturnDocument.AFTER,
    )
    if result is None:
        raise HTTPException(status_code=404, detail="Application not found.")
    return serialize_application(result)
