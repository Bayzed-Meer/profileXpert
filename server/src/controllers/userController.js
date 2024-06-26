const UserData = require("../models/userData");
const User = require("../models/user");

exports.getProfile = async (req, res) => {
  try {
    const { userId } = req.user;

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

exports.createProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    const { name, designation, age, profileSummary } = req.body;

    const userData = new UserData({
      userId,
      name,
      designation,
      age,
      profileSummary,
      profilePicture: req.file ? req.file.path : "",
    });

    await userData.save();

    res.status(200).json({ message: "Profile created successfully" });
  } catch (error) {
    if (error.name === "ValidationError") {
      const validationErrors = {};
      for (const field in error.errors) {
        validationErrors[field] = error.errors[field].message;
      }
      return res
        .status(400)
        .json({ message: "Validation error", errors: validationErrors });
    }
    console.error("Error creating profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { userId } = req.user;

    const { name, designation, age, profileSummary } = req.body;

    const userData = await UserData.findOne({ userId });

    if (!userData) {
      return res.status(404).json({ message: "User data not found" });
    }

    userData.name = name ? name : userData.name;
    userData.designation = designation ? designation : userData.designation;
    userData.age = age ? age : userData.age;
    userData.profileSummary = profileSummary
      ? profileSummary
      : userData.profileSummary;
    userData.profilePicture = req.file
      ? req.file.path
      : userData.profilePicture;

    await userData.save();

    res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    if (error.name === "ValidationError") {
      const validationErrors = {};
      for (const field in error.errors) {
        validationErrors[field] = error.errors[field].message;
      }
      return res
        .status(400)
        .json({ message: "Validation error", errors: validationErrors });
    }
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.shareProfile = async (req, res) => {
  try {
    const { email } = req.body;
    const senderId = req.user.userId;

    const receiver = await User.findOne({ email });

    if (!receiver) {
      return res.status(404).json({ message: "Receiver user not found" });
    }

    const sender = await User.findById(senderId);

    if (!sender) {
      return res.status(404).json({ message: "Sender user not found" });
    }

    if (receiver.email === sender.email) {
      return res
        .status(400)
        .json({ message: "You cannot share your profile with yourself" });
    }

    await User.updateOne(
      { _id: receiver._id },
      {
        $addToSet: {
          sharedWithMe: {
            userId: senderId,
            username: sender.username,
          },
        },
      }
    );

    res.status(200).json({ message: "Profile shared successfully" });
  } catch (error) {
    console.error("Error sharing profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getSharedUser = async (req, res) => {
  try {
    const { userId } = req.user;

    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const sharedUser = user.sharedWithMe.map((sharedUser) => ({
      userId: sharedUser.userId,
      username: sharedUser.username,
    }));

    return res.status(200).json(sharedUser);
  } catch (error) {
    console.error("Error fetching shared user data:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getSharedUserData = async (req, res) => {
  try {
    const { userId } = req.params;

    const userData = await UserData.findOne({ userId: userId });

    if (!userData) {
      return res.status(204).json({ message: "User data not found" });
    }

    res.status(200).json(userData);
  } catch (error) {
    console.error("Error fetching shared user data:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getWorkExperience = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;

    const userData = await UserData.findOne({ userId: userId });

    if (!userData) {
      return res.status(404).json({ message: "User data not found" });
    }

    const workExperience = userData.workExperiences.find(
      (exp) => exp._id.toString() === id
    );

    if (!workExperience) {
      return res.status(404).json({ message: "Work experience not found" });
    }

    res.status(200).json(workExperience);
  } catch (error) {
    console.error("Error fetching work experience data:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.addWorkExperience = async (req, res) => {
  try {
    const { userId } = req.user;
    const { startDate, endDate, current, jobTitle, company, jobDescription } =
      req.body;

    const userData = await UserData.findOne({ userId });

    if (!userData) {
      return res.status(404).json({ message: "User data not found" });
    }

    userData.workExperiences.push({
      startDate,
      endDate,
      current,
      jobTitle,
      company,
      jobDescription,
    });

    await userData.save();

    res.status(200).json({ message: "Work experience added successfully" });
  } catch (error) {
    console.error("Error adding work experience:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateWorkExperience = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;
    const { startDate, endDate, current, jobTitle, company, jobDescription } =
      req.body;

    const userData = await UserData.findOne({ userId });

    if (!userData) {
      return res.status(404).json({ message: "User data not found" });
    }

    const workExperience = userData.workExperiences.find(
      (exp) => exp._id.toString() === id
    );

    if (!workExperience) {
      return res.status(404).json({ message: "Work experience not found" });
    }

    workExperience.startDate = startDate;
    workExperience.endDate = endDate;
    workExperience.current = current;
    workExperience.jobTitle = jobTitle;
    workExperience.company = company;
    workExperience.jobDescription = jobDescription;

    await userData.save();

    res.status(200).json({ message: "Work experience updated successfully" });
  } catch (error) {
    console.error("Error updating work experience:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteWorkExperience = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;

    const userData = await UserData.findOne({ userId: userId });

    if (!userData) {
      return res.status(404).json({ message: "User data not found" });
    }

    const index = userData.workExperiences.findIndex(
      (exp) => exp._id.toString() === id
    );

    if (index === -1) {
      return res.status(404).json({ message: "Work experience not found" });
    }

    userData.workExperiences.splice(index, 1);

    await userData.save();

    res.status(200).json({ message: "Work experience deleted successfully" });
  } catch (error) {
    console.error("Error deleting work experience:", error);
    res.status(500).json({ message: "Server error" });
  }
};
