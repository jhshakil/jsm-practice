"use server";

import Question from "@/database/question.model";
import { connectToDatabase } from "../mongoose";
import Tag from "@/database/tag.model";

export async function createQuestion(params: any) {
  try {
    connectToDatabase();

    const { title, content, tags, author, path } = params;

    // Create the question

    const question = await Question.create({
      title,
      content,
      author,
    });

    const tagDocuments = [];

    // Create te tags or get them if they already exist
    for (const tag of tags) {
      const exixtingTag = await Tag.findOneAndUpdate(
        { name: { $regex: new RegExp(`^${tag}$`, "i") } },
        { $setOnInsert: { name: tag }, $push: { question: question._id } },
        { upsert: true, new: true }
      );

      tagDocuments.push(exixtingTag._id);
    }

    await Question.findByIdAndUpdate(question._id, {
      $push: { tags: { $each: tagDocuments } },
    });

    // Create an interaction record for the User's ask_question action
    // Increment author's reputaiton by +5 for creating a question
  } catch (error) {}
}
