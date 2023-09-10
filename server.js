import express from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";

const prisma = new PrismaClient();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send({ success: true, message: "Welcome to the Emoji Server" });
});


//getting all the messages
app.get("/messages", async (req, res) => {
  const message = await prisma.message.findMany({
    include: {
      children: {
        include: {
          children: {}
        }
      }
    }
  });
  res.send({ success: true, message, });
});

// creating a new message
app.post('/messages', async (req, res) => {
  const { text, parentId } = req.body;

  //checks if text is provided in request body, if not it returns an error response
  if (!text) {
    return res.send({
      success: false,
      error: 'Text must be provided to create a message!',
    });
  }


  try {
    let message;
    if (parentId) {
      // Check if parent message exists
      const parentMessage = await prisma.message.findUnique({
        where: {
          id: parentId,
        },
      });

      if (!parentMessage) {
        return res.send({
          success: false,
          error: 'Parent message not found!',
        });
      }

      // Create a child message with the parentId
      message = await prisma.message.create({
        data: {
          text,
          parentId,
        },
      });
    } else {
      // Create a regular message without parentId
      message = await prisma.message.create({
        data: {
          text,
        },
      });
    }

    if (parentId) {
      await prisma.message.update({
        where: {
          id: parentId,
        },
        data: {
          children: {
            connect: { id: message.id },
          },
        },
      });
    }

    res.send({ success: true, message });
  } catch (error) {
    res.send({ success: false, error: error.message });
  }
});

//update a message
app.put("/messages/:messageId", async (req, res) => {
  const { messageId } = req.params;
  const { text } = req.body;

  if (!text) {
    return res.send({ success: false, message: "you must have a text to update" })
  }

  const messageSearch = await prisma.message.findFirst({
    where: {
      id: messageId
    },
  });
  if (!messageSearch) {
    return res.send({ success: false, error: 'Message not found!' });
  }

  try {
    const updatedMessage = await prisma.message.update({
      where: {
        id: messageId
      },
      data: {
        text
      }
    })
    res.send({ success: true, updatedMessage });
  } catch (error) {
    res.send({ success: false, error: error.message });
  }
});

//Deleting a message
app.delete("/messages/:messageId", async (req, res) => {
  const { messageId } = req.params


  const messageSearch = await prisma.message.findFirst({
    where: {
      id: messageId
    },
  });
  if (!messageSearch) {
    return res.send({ success: false, error: 'No message to delete!' });
  }

  try {
    const deleteMessage = await prisma.message.delete({
      where: {
        id: messageId
      }
    });
    res.send({ success: true, deleteMessage });
  } catch (error) {
    res.send({ success: false, error: error.message });
  }
});


app.use((error, req, res, next) => {
  res.send({
    success: false,
    errror: error.message,
  });
});

app.use((req, res) => {
  res.send({
    success: false,
    errror: "No route found.",
  });
});



app.listen(PORT, () =>
  console.log(`Example app listening at http://localhost:${PORT}`)
);