import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    _id: {
      type: String, // Clerk user ID
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: "",
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    preferences: {
      theme: {
        type: String,
        enum: ["light", "dark", "system"],
        default: "system",
      },
      aiModel: {
        type: String,
        enum: ["gpt-3.5-turbo", "gpt-4"],
        default: "gpt-3.5-turbo",
      },
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Prevent model redefinition during hot reload in development
const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;