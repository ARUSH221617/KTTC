import "server-only";

import { db } from "@/lib/db";
import { ChatSDKError } from "../errors";
import type { AppUsage } from "../usage";
import { generateUUID } from "../utils";
import { generateHashedPassword } from "./utils";
import type { VisibilityType } from "@/components/agent/visibility-selector";
import type { ArtifactKind } from "@/components/agent/artifact";
import { Prisma } from "@prisma/client";

// Define Types locally since we removed src/lib/db/schema.ts
// These should match what Prisma generates, but we might need to map them.

export async function getUser(email: string) {
  try {
    const users = await db.user.findMany({
      where: { email },
    });
    return users;
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get user by email"
    );
  }
}

export async function createUser(email: string, password: string) {
  const hashedPassword = generateHashedPassword(password);

  try {
    return await db.user.create({
      data: { email, password: hashedPassword },
    });
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to create user");
  }
}

export async function createGuestUser() {
  const email = `guest-${Date.now()}`;
  const password = generateHashedPassword(generateUUID());

  try {
    const user = await db.user.create({
      data: { email, password },
      select: { id: true, email: true },
    });
    return [user]; // Return array to match previous signature if needed, or just object?
    // Drizzle returning() returns array.
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to create guest user"
    );
  }
}

export async function saveChat({
  id,
  userId,
  title,
  visibility,
}: {
  id: string;
  userId: string;
  title: string;
  visibility: VisibilityType;
}) {
  try {
    return await db.chat.create({
      data: {
        id,
        createdAt: new Date(),
        userId,
        title,
        visibility,
      },
    });
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to save chat");
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    // Cascade delete handles votes, messages, streams
    // But existing Drizzle code deleted manually. Prisma supports cascade.
    // However, the original code returned the deleted chats.
    const deletedChat = await db.chat.delete({
      where: { id },
    });
    return deletedChat;
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to delete chat by id"
    );
  }
}

export async function deleteAllChatsByUserId({ userId }: { userId: string }) {
  try {
    const deletedChats = await db.chat.deleteMany({
      where: { userId },
    });
    // deleteMany returns { count: number }
    return { deletedCount: deletedChats.count };
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to delete all chats by user id"
    );
  }
}

export async function getChatsByUserId({
  id,
  limit,
  startingAfter,
  endingBefore,
}: {
  id: string;
  limit: number;
  startingAfter: string | null;
  endingBefore: string | null;
}) {
  try {
    // Pagination logic
    let cursor: Prisma.ChatWhereInput | undefined;
    let take = limit + 1;
    let skip = 0;

    const where: Prisma.ChatWhereInput = { userId: id };

    // This logic replicates Drizzle's cursor logic
    if (startingAfter) {
      const selectedChat = await db.chat.findUnique({
         where: { id: startingAfter },
         select: { createdAt: true }
      });

      if (selectedChat) {
        where.createdAt = { gt: selectedChat.createdAt };
      }
    } else if (endingBefore) {
       const selectedChat = await db.chat.findUnique({
         where: { id: endingBefore },
         select: { createdAt: true }
      });

      if (selectedChat) {
         where.createdAt = { lt: selectedChat.createdAt };
      }
    }

    const chats = await db.chat.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take,
    });

    const hasMore = chats.length > limit;
    const filteredChats = hasMore ? chats.slice(0, limit) : chats;

    // Prisma JSON fields are weirdly typed sometimes, map if necessary
    // But return type of Drizzle was inferred. We might need to cast or ensure structure match.
    // Specifically `lastContext` is Json.

    return {
      chats: filteredChats,
      hasMore,
    };
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get chats by user id"
    );
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    return await db.chat.findUnique({
      where: { id },
    });
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to get chat by id");
  }
}

export async function saveMessages({ messages }: { messages: any[] }) {
  try {
    return await db.message.createMany({
      data: messages.map(m => ({
          id: m.id,
          chatId: m.chatId,
          role: m.role,
          parts: m.parts ?? [],
          attachments: m.attachments,
          createdAt: m.createdAt,
      })),
    });
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to save messages");
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    return await db.message.findMany({
      where: { chatId: id },
      orderBy: { createdAt: 'asc' },
    });
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get messages by chat id"
    );
  }
}

export async function voteMessage({
  chatId,
  messageId,
  type,
}: {
  chatId: string;
  messageId: string;
  type: "up" | "down";
}) {
  try {
    return await db.vote.upsert({
      where: {
        chatId_messageId: {
          chatId,
          messageId,
        }
      },
      update: {
        isUpvoted: type === "up",
      },
      create: {
        chatId,
        messageId,
        isUpvoted: type === "up",
      },
    });
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to vote message");
  }
}

export async function getVotesByChatId({ id }: { id: string }) {
  try {
    return await db.vote.findMany({
      where: { chatId: id },
    });
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get votes by chat id"
    );
  }
}

export async function saveDocument({
  id,
  title,
  kind,
  content,
  userId,
}: {
  id: string;
  title: string;
  kind: ArtifactKind;
  content: string;
  userId: string;
}) {
  try {
    const doc = await db.document.create({
      data: {
        id,
        title,
        kind,
        content,
        userId,
        createdAt: new Date(),
      },
    });
    return [doc];
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to save document");
  }
}

export async function getDocumentsById({ id }: { id: string }) {
  try {
    return await db.document.findMany({
      where: { id }, // id in prisma is not unique? Ah, PK is [id, createdAt]
      orderBy: { createdAt: 'asc' },
    });
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get documents by id"
    );
  }
}

export async function getDocumentById({ id }: { id: string }) {
  try {
    const docs = await db.document.findMany({
      where: { id },
      orderBy: { createdAt: 'desc' },
      take: 1,
    });
    return docs[0] || null;
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get document by id"
    );
  }
}

export async function deleteDocumentsByIdAfterTimestamp({
  id,
  timestamp,
}: {
  id: string;
  timestamp: Date;
}) {
  try {
    // Drizzle logic deleted suggestions first, then documents. Prisma cascade should handle it if setup correctly.
    // In schema: Suggestion -> Document with onDelete: Cascade.
    // So we just delete Document.

    // BUT we need to target specific [id, createdAt] tuples or range.
    // The query is `where(and(eq(document.id, id), gt(document.createdAt, timestamp)))`

    // We can't delete directly with join condition easily, but here it's simple range on Document table.
    // But `Suggestion` references `Document` via composite key. Cascade works if we delete the parent.

    // However, `deleteMany` in Prisma does not trigger cascade deletions in the database unless the FK constraint itself is ON DELETE CASCADE.
    // My schema defined `onDelete: Cascade`. So `deleteMany` on Document should work fine.

    // But wait, `deleteMany` vs `delete`. `deleteMany` corresponds to `DELETE FROM table WHERE ...`. The DB handles cascade.

    // But we should verify.
    // Drizzle code:
    // await db.delete(suggestion).where(...)
    // await db.delete(document).where(...)

    // I will replicate explicit deletion for safety or rely on DB cascade if confirmed.
    // Given schema:
    // model Suggestion { ... document Document @relation(..., onDelete: Cascade) }
    // It should be fine.

    // But let's look at `deleteDocumentsByIdAfterTimestamp` logic again.
    // It filters suggestions by `documentCreatedAt > timestamp`.
    // And documents by `createdAt > timestamp`.
    // Since Suggestion FK uses documentCreatedAt, if we delete the document, the suggestion goes too.

    // Wait, if we delete the document, the suggestion referencing it is deleted.
    // So we just need to delete the documents.

    // But we need to return the deleted documents. `deleteMany` returns count.
    // Drizzle returned `returning()`.

    // To return deleted items in Prisma (Postgres), `deleteMany` doesn't return data.
    // We must find them first, then delete.

    const docsToDelete = await db.document.findMany({
        where: {
            id,
            createdAt: { gt: timestamp }
        }
    });

    if (docsToDelete.length > 0) {
        await db.document.deleteMany({
            where: {
                id,
                createdAt: { gt: timestamp }
            }
        });
    }

    return docsToDelete;

  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to delete documents by id after timestamp"
    );
  }
}

export async function saveSuggestions({
  suggestions,
}: {
  suggestions: any[];
}) {
  try {
    return await db.suggestion.createMany({
      data: suggestions,
    });
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to save suggestions"
    );
  }
}

export async function getSuggestionsByDocumentId({
  documentId,
}: {
  documentId: string;
}) {
  try {
    return await db.suggestion.findMany({
      where: { documentId },
    });
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get suggestions by document id"
    );
  }
}

export async function getMessageById({ id }: { id: string }) {
  try {
    const msg = await db.message.findUnique({
        where: { id }
    });
    return msg ? [msg] : [];
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get message by id"
    );
  }
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  try {
    // Find messages to delete
    const messagesToDelete = await db.message.findMany({
      where: {
        chatId,
        createdAt: { gte: timestamp },
      },
      select: { id: true },
    });

    const messageIds = messagesToDelete.map((m) => m.id);

    if (messageIds.length > 0) {
       // Manual delete of votes not needed if cascade is set, but Drizzle code did it.
       // My schema has `Vote -> Message (onDelete: Cascade)`.

       await db.message.deleteMany({
         where: {
           id: { in: messageIds },
         },
       });

       // Drizzle code returned delete result of messages. `deleteMany` returns count.
       // The function didn't explicitly return the messages, just the result of delete operation which is usually count or rows.
       // The original function return type was inferred.
    }
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to delete messages by chat id after timestamp"
    );
  }
}

export async function updateChatVisibilityById({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: "private" | "public";
}) {
  try {
    return await db.chat.update({
      where: { id: chatId },
      data: { visibility },
    });
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to update chat visibility by id"
    );
  }
}

export async function updateChatLastContextById({
  chatId,
  context,
}: {
  chatId: string;
  context: AppUsage;
}) {
  try {
    return await db.chat.update({
      where: { id: chatId },
      data: { lastContext: context as any }, // Cast to any for Json compatibility if needed
    });
  } catch (error) {
    console.warn("Failed to update lastContext for chat", chatId, error);
    return;
  }
}

export async function getMessageCountByUserId({
  id,
  differenceInHours,
}: {
  id: string;
  differenceInHours: number;
}) {
  if (!id) {
    throw new ChatSDKError(
      "bad_request:database",
      "User ID is required to get message count"
    );
  }

  try {
    const twentyFourHoursAgo = new Date(
      Date.now() - differenceInHours * 60 * 60 * 1000
    );

    const count = await db.message.count({
      where: {
        role: "user",
        createdAt: { gte: twentyFourHoursAgo },
        chat: {
          userId: id,
        },
      },
    });

    return count;
  } catch (error) {
    console.error("Failed to get message count by user id", error);
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get message count by user id"
    );
  }
}

export async function createStreamId({
  streamId,
  chatId,
}: {
  streamId: string;
  chatId: string;
}) {
  try {
    await db.stream.create({
      data: {
        id: streamId,
        chatId,
        createdAt: new Date(),
      },
    });
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to create stream id"
    );
  }
}

export async function getStreamIdsByChatId({ chatId }: { chatId: string }) {
  try {
    const streams = await db.stream.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    });

    return streams.map(({ id }) => id);
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get stream ids by chat id"
    );
  }
}
