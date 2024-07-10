import { UserData } from "../models/userData.js";

export async function getUserData(req, res) {
  try {
    const userData = await UserData.findById(req.params.id);
    res.status(200).json(userData);
  } catch (error) {
    console.error("Error fetching userData:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getUserDataEnrollments(req, res) {
  try {
    const userData = await UserData.findById(req.params.id).select(
      "enrollments"
    );
    res.status(200).json(userData);
  } catch (error) {
    console.error("Error fetching userDataEnrollments:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getUserDataIsEnrolled(req, res) {
  try {
    const userData = await UserData.findById(req.params.id).select(
      "enrollments"
    );

    res
      .status(200)
      .json(userData.enrollments.includes(req.body.courseId) ? true : false);
  } catch (error) {
    console.error("Error fetching userDataEnrollments:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateUserDataEnrollments(req, res) {
  try {
    const userData = await UserData.findById(req.params.id);
    userData.enrollments.addToSet(req.body.courseId);
    userData.save();
    res.status(200).json(userData);
  } catch (error) {
    console.error("Error updating enrollments:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteUserDataEnrollment(req, res) {
  try {
    const userData = await UserData.findById(req.params.id);
    userData.enrollments.remove(req.body.courseId);
    userData.save();
    res.status(200).json(userData);
  } catch (error) {
    console.error("Error deleting enrollment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getUserDataLectureData(req, res) {
  try {
    const lectureData = await UserData.findOne(
      {
        _id: req.params.userId,
        "lectureData.lectureId": req.params.lectureId,
      },
      { "lectureData.$": 1 }
    );
    if (lectureData && lectureData.lectureData.length > 0) {
      res.status(200).json(lectureData.lectureData[0]);
    } else {
      res.status(200).json(null);
    }
  } catch (error) {
    console.error("Error fetching userData lectureData:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateUserDataLectureData(req, res) {
  try {
    const updateResult = await UserData.updateOne(
      { _id: req.params.id, "lectureData.lectureId": req.body.lectureId },
      {
        $set: {
          "lectureData.$.watchTime": req.body.watchTime,
          "lectureData.$.notes": req.body.notes,
          "lectureData.$.highlightedText": req.body.highlightedText,
          // 'lectureData.$.comments': req.body.commentObjectIds
        },
      }
    );
    if (updateResult.matchedCount === 0) {
      await UserData.updateOne(
        { _id: req.params.id },
        {
          $push: {
            lectureData: {
              lectureId: req.body.lectureId,
              watchTime: req.body.watchTime,
              notes: req.body.notes,
              highlightedText: req.body.highlightedText,
              // comments: req.body.commentObjectIds
            },
          },
        }
      );
    }
    res.status(200).json(updateResult);
  } catch (error) {
    console.error("Error updating lectureData:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
