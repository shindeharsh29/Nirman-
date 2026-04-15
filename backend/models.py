from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_admin = Column(Boolean, default=False)
    complaints = relationship("Complaint", back_populates="reporter")

class Complaint(Base):
    __tablename__ = "complaints"
    id = Column(Integer, primary_key=True, index=True)
    description = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    location_name = Column(String, nullable=True)
    location_importance_score = Column(Float, default=1.0) # 1.0 to 10.0
    image_path = Column(String)
    status = Column(String, default="Pending") # Pending, Verified, Resolved
    priority_level = Column(String, default="Low") # Low, Medium, High, Critical
    priority_score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    reporter_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    reporter = relationship("User", back_populates="complaints")
    verifications = relationship("ImageVerification", back_populates="complaint")

class ImageVerification(Base):
    __tablename__ = "image_verifications"
    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"))
    image_hash = Column(String, index=True) # for duplicate detection
    ai_confidence = Column(Float, default=0.0)
    damage_type = Column(String, nullable=True) # e.g. pothole, crack
    bounding_boxes = Column(String, nullable=True) # JSON string of bounding boxes
    verification_source = Column(String, default="User") # User, Drone
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    complaint = relationship("Complaint", back_populates="verifications")
