const UserData = require("../models/userData");
const User = require("../models/user");

exports.saveOrUpdateUserData = async (req, res) => {
  try {
    const { userId } = req.params;
    let userData = await UserData.findOne({ userId: userId });

    if (!userData) {
      userData = new UserData({
        userId: userId,
        name: req.body.name,
        designation: req.body.designation,
        age: req.body.age,
        profileSummary: req.body.profileSummary,
        profilePicture: req.file ? req.file.path : "",
        workExperiences: req.body.workExperiences.map((experience) => ({
          startDate: experience.startDate,
          endDate: experience.endDate,
          current: experience.current,
          jobTitle: experience.jobTitle,
          company: experience.company,
          jobDescription: experience.jobDescription,
        })),
      });
    } else {
      userData.name = req.body.name;
      userData.age = req.body.age;
      userData.profileSummary = req.body.profileSummary;
      userData.designation = req.body.designation;
      userData.profilePicture = req.file
        ? req.file.path
        : userData.profilePicture;
      userData.workExperiences = req.body.workExperiences.map((experience) => ({
        startDate: experience.startDate,
        endDate: experience.endDate,
        current: experience.current,
        jobTitle: experience.jobTitle,
        company: experience.company,
        jobDescription: experience.jobDescription,
      }));
    }

    await userData.save();

    res
      .status(200)
      .json({ message: "Profile data saved/updated successfully" });
  } catch (error) {
    console.log(error);

    if (error.name === "ValidationError") {
      let validationErrors = [];
      for (let field in error.errors) {
        validationErrors.push(error.errors[field].message);
      }
      return res
        .status(400)
        .json({ message: "Validation error", errors: validationErrors });
    }
    console.error("Error saving/updating profile data:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUserData = async (req, res) => {
  try {
    const { userId } = req.params;
    const userData = await UserData.findOne({ userId: userId });

    if (!userData) {
      return res.status(204).json({ message: "User data not found" });
    }

    res.status(200).json(userData);
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.shareProfile = async (req, res) => {
  try {
    const { email } = req.body;

    const senderUserId = req.params.userId;
    const receiver = await User.findOne({ email });

    if (!receiver) {
      return res.status(404).json({ message: "Receiver user not found" });
    }
    await User.updateOne(
      { _id: receiver._id },
      { $addToSet: { sharedWithMe: senderUserId } }
    );
    await User.updateOne(
      { _id: senderUserId },
      { $addToSet: { whomIShared: receiver._id } }
    );
    res.status(200).json({ message: "Profile shared successfully" });
  } catch (error) {
    console.error("Error sharing profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};
