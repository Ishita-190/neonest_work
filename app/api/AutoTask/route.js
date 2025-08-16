import { NextResponse } from "next/server";
import JSONAgent from "@/lib/agent";
import { GoogleGenerativeAI } from "@google/generative-ai";
import connectDB from "@/lib/connectDB";
import User from "@/app/models/User.model";
import { authenticateToken } from "@/lib/auth";
import { 
  saveMemory,
  saveDoctorContact,
  saveEssentials,
  saveFeeding,
  saveGrowth,
  saveNotification,
  saveSleep,
  saveVaccination
} from "./saveData";
import { cloudinary } from "@/lib/cloudinary";
import connectDB from "@/lib/connectDB";

// Initialize AI model
const genAi = new GoogleGenerativeAI(process.env.GEMINI_API);

export async function POST(req) {
  await connectDB(); 
  const errorMessage = { isAction: false, request: "failed" };

  try {
    const formData = await req.formData();
    const message = formData.get("message");
    const file = formData.get("file");
    const time = formData.get("time");

    if (!message || message.length < 9) {
      return NextResponse.json(
        { ...errorMessage, actionName: "Too Few Information" },
        { status: 400 }
      );
    }

    const agent = new JSONAgent({ model: genAi });
    const date = new Date();
    const prompt = `${message}. The date is ${date.toUTCString()} and time is ${time || date.toTimeString()}.`;

    const agent_reply = await agent.getResponse(prompt);
    console.log("Agent reply:", agent_reply);
    console.log("Prompt:", prompt);

    const authData = await authenticateToken(req);
    const currentUser = authData?.user;
    const userExists = await User.findById(currentUser?.id);

    if (!currentUser || !userExists) {
      return NextResponse.json(
        { ...errorMessage, actionName: "Authentication Failed" },
        { status: 401 }
      );
    }

    // Upload file to Cloudinary
    const uploadFile = async () => {
      if (!file) return null;

      try {
        const buffer = Buffer.from(await file.arrayBuffer());

        return await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: "auto" },
            (error, result) => {
              if (error) reject(error);
              else resolve({ type: result.resource_type, url: result.secure_url });
            }
          );
          stream.end(buffer);
        });
      } catch (err) {
        console.error("Cloudinary upload failed:", err);
        return null;
      }
    };

    // Save data based on action type
    const saveData = async (task) => {
      const action = task.actionName?.toLowerCase();
      switch(action) {
        case "growth":
          return await saveGrowth(task, currentUser);
        case "feeding":
          return await saveFeeding(task, currentUser);
        case "sleep":
          return await saveSleep(task, currentUser);
        case "vaccination":
          return await saveVaccination(task, currentUser);
        case "doctor_contact":
          return await saveDoctorContact(task, currentUser);
        case "essentials":
          return await saveEssentials(task, currentUser);
        case "memory":
          if (!file) {
            return { isAction: false, actionName: "Media Required", request: "insert", status: "failed" };
          }
          const uploadData = await uploadFile();
          return await saveMemory(task, currentUser, uploadData);
        case "notification":
          return await saveNotification(task, currentUser);
        default:
          return { ...errorMessage, actionName: "Invalid request" };
      }
    };

    let replyMessage;
    if (Array.isArray(agent_reply)) {
      replyMessage = await Promise.all(agent_reply.map(task => saveData(task)));
    } else {
      replyMessage = [agent_reply ? await saveData(agent_reply) : { ...errorMessage, actionName: "Invalid request" }];
    }

    console.log("Reply Message:", replyMessage);
    return NextResponse.json(replyMessage.length > 0 ? replyMessage : { ...errorMessage, actionName: "Invalid request" });

  } catch (err) {
    console.error("Error Occurred:", err);
    return NextResponse.json({ ...errorMessage, actionName: "Internal Server Error" }, { status: 500 });
  }
}
