import prisma from "../db/db.config.js";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const createPost = async (req, res) => {
  try {
    const {
      Title,
      Description,
      gitHubLink,
      deployedLink,
      demoVideoLink,
      technologiesUsed,
      userId,
    } = req.body;

    const uploadedFile = req.file;
    const thumbnailImgURL = `/${uploadedFile.filename}`;
    const uploadResult = await prisma.posts.create({
      data: {
        name: Title,
        description: Description,
        gitHubLink: gitHubLink,
        deployedLink: deployedLink,
        demoVideoLink: demoVideoLink,
        technologiesUsed: [...technologiesUsed.split(",")],
        thumbnailImgURL: thumbnailImgURL,
        userId: parseInt(userId),
      },
    });
    // if (uploadResult) {
    await prisma.chatRoom.create({ data: { postId: uploadResult?.id } });
    // }
    return res.json({ status: 200, message: "Post uploaded successfully" });
  } catch (error) {
    return res.json({
      status: 500,
      message: "Error while uploading post ",
      error: error.message,
    });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    // console.log(req.query);
    // if (req?.query?.collage) {
    //   const postsData = await prisma.posts.findMany({
    //     where: {
    //       collage: req.query.userId,
    //     },
    //     orderBy: {
    //       created_at: "asc",
    //     },
    //     include: {
    //       user: {
    //         select: {
    //           name: true,
    //         },
    //       },
    //     },
    //   });
    //   return res.json({
    //     status: 200,
    //     message: "success",
    //     data: postsData,
    //   });
    // }

    if (req?.query?.userId) {
      const postsData = await prisma.posts.findMany({
        where: {
          userId: parseInt(req.query.userId),
        },
        orderBy: {
          created_at: "asc",
        },
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
      });
      const moddifiedPostData = postsData?.map((post) => ({
        ...post,
        user: post.user.name,
      }));
      return res.json({
        status: 200,
        message: "success",
        data: moddifiedPostData,
      });
    }

    const { currentUserId } = req.query;
    if (currentUserId) {
      const postsData = await prisma.posts.findMany({
        orderBy: { created_at: "asc" },
        include: {
          user: { select: { name: true } },
          contributionRequests: {
            where: { requesterId: parseInt(currentUserId) },
            select: { status: true },
          },
        },
      });

      const moddifiedPostData = postsData?.map((post) => ({
        ...post,
        user: post.user.name,
      }));

      return res.json({
        status: 200,
        message: "success",
        data: moddifiedPostData,
      });
    }
    // console.log("currentUserId", currentUserId);
    const postsData = await prisma.posts.findMany({
      orderBy: { created_at: "asc" },
      include: { user: { select: { name: true } } },
    });

    const moddifiedPostData = postsData?.map((post) => ({
      ...post,
      user: post.user.name,
    }));

    return res.json({
      status: 200,
      message: "success",
      data: moddifiedPostData,
    });
  } catch (error) {
    return res.json({
      status: 500,
      message: "Error fetching posts",
      error: error.message,
    });
  }
};

export const getSinglePost = async (req, res) => {
  try {
    const { id: pid } = req.params;

    const postData = await prisma.posts.findUnique({
      where: {
        id: parseInt(pid),
      },
      include: {
        user: {
          select: {
            name: true,
            collegeName: true,
          },
        },
        contributionRequests: {
          where: { postId: parseInt(pid), status: "Accepted" },
          include: {
            requester: { select: { name: true, collegeName: true } },
          },
        },
      },
    });

    if (!postData) {
      return res.json({
        status: 404,
        message: "Post not found",
      });
    }

    const { currentUserId } = req.query;
    if (currentUserId) {
      const postsData = await prisma.posts.findMany({
        orderBy: { created_at: "asc" },
        include: {
          user: { select: { name: true } },
          contributionRequests: {
            where: { requesterId: parseInt(currentUserId) },
            select: { status: true },
          },
        },
      });

      const moddifiedPostData = postsData?.map((post) => ({
        ...post,
        user: post.user.name,
      }));

      return res.json({
        status: 200,
        message: "success",
        data: moddifiedPostData,
      });
    } else {
      return res.json({
        status: 200,
        message: "success",
        data: {
          ...postData,
          user: postData.user.name,
          collegeName: postData.user.collegeName,
        },
      });
    }
  } catch (error) {
    return res.json({
      status: 500,
      message: "Error getting post",
      error: error,
      error: error.message,
    });
  }
};

export const deletePost = async (req, res) => {
  try {
    const resultPostDelete = await prisma.posts.delete({
      where: {
        id: parseInt(req.params.id),
      },
    });

    const databasePath = resultPostDelete.thumbnailImgURL;

    const filePath = path.join(__dirname, "../routes", "uploads", databasePath);

    if (!resultPostDelete) {
      return res.json({ status: 401, message: "Post not found to delete" });
    }

    await fs.promises.unlink(filePath);

    return res.json({
      status: 200,
      message: "Post Deleted",
    });
  } catch (error) {
    return res.json({
      status: 500,
      message: "Error deleting post",
      error: error.message,
    });
  }
};

//Update post Controller

export const updatePost = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);

    const post = await prisma.posts.findUnique({
      where: {
        id: postId,
      },
    });

    if (!post) {
      return res.json({
        status: 404,
        message: "Post not found",
      });
    }

    if (post.userId !== req.user.result.id) {
      return res.json({
        status: 403,
        message: "You can only edit your own posts",
      });
    }

    const {
      Title,
      Description,
      gitHubLink,
      deployedLink,
      demoVideoLink,
      technologiesUsed,
    } = req.body;

    if (
      Title == null ||
      Description == null ||
      String(Title).trim() === "" ||
      String(Description).trim() === ""
    ) {
      return res.json({
        status: 400,
        message: "Title and description are required",
      });
    }

    if (technologiesUsed !== undefined && technologiesUsed.length === 0) {
      return res.json({
        status: 400,
        message: "At least one technology is required",
      });
    }

    const data = {};
    if (Title !== undefined) data.name = Title;
    if (Description !== undefined) data.description = Description;
    if (gitHubLink !== undefined) data.gitHubLink = gitHubLink;
    if (deployedLink !== undefined) data.deployedLink = deployedLink;
    if (demoVideoLink !== undefined) data.demoVideoLink = demoVideoLink;
    if (technologiesUsed !== undefined) data.technologiesUsed = technologiesUsed;

    const updatedPost = await prisma.posts.update({
      where: {
        id: postId,
      },
      data,
    });

    return res.json({
      status: 200,
      message: "Post updated successfully",
      data: updatedPost,
    });
  } catch (error) {
    res.json({
      status: 500,
      message: "Internal server Error",
      error: error.message,
    });
  }
};

export const likePost = async (req, res) => {
  try {
    const userId = req.body.userID.toString();
    const postId = parseInt(req.body.id);

    let postToLike = await prisma.posts.findUnique({
      where: {
        id: postId,
      },
    });
    if (!postToLike) {
      return res.json({
        status: 404,
        message: "post not found",
      });
    }
    if (postToLike.likes.includes(userId)) {
      return res.json({
        status: "403",
        message: "post already liked",
      });
    }
    const updatedPost = await prisma.posts.update({
      where: {
        id: postId,
      },
      data: {
        likes: [...postToLike.likes, userId],
      },
    });
    res.json({
      status: 200,
      message: "Post liked",
      likesCount: updatedPost.likes.length,
    });
  } catch (error) {
    res.json({
      status: 500,
      message: "error while liking a post",
      error: error.message,
    });
  }
};

export const removeLikePost = async (req, res) => {
  try {
    const userID = req.body.userID.toString();
    const postID = parseInt(req.body.id);
    const postToRemoveLike = await prisma.posts.findUnique({
      where: {
        id: postID,
      },
    });

    if (!postToRemoveLike) {
      res.json({
        status: 404,
        message: "Post not Found",
      });
    }

    let updatedLikes = postToRemoveLike?.likes?.filter((id) => id !== userID);

    const updatedPost = await prisma.posts.update({
      where: {
        id: postID,
      },
      data: {
        likes: updatedLikes,
      },
    });
    res.json({
      status: 200,
      message: "like removed",
      likesCount: updatedPost.likes.length,
    });
  } catch (error) {
    res.json({
      status: 500,
      message: "error while liking a post",
      error: error.message,
    });
  }
};

export const getFilteredPosts = async (req, res) => {
  try {
    const { keyword } = req.query;
    const { collegeName } = req.query;
    if (keyword) {
      const posts = await prisma.posts.findMany({
        where: {
          OR: [
            {
              name: {
                contains: keyword,
                mode: "insensitive", // This makes the search case-insensitive
              },
            },
            {
              description: {
                contains: keyword,
                mode: "insensitive",
              },
            },
            {
              technologiesUsed: {
                has: keyword.toUpperCase(),
              },
            },
          ],
        },
        include: {
          contributionRequests: true, // Include contribution requests if needed\
          user: true,
        },
      });
      const modifiedPosts = posts.map((post) => ({
        ...post,
        user: post.user.name,
      }));
      res.json({ status: 200, data: modifiedPosts, message: "success" });
    }
    if (collegeName) {
      const postsData = await prisma.posts.findMany({
        where: {
          user: {
            collegeName: collegeName,
          },
        },
        select: {
          id: true,
          name: true,
          description: true,
          gitHubLink: true,
          deployedLink: true,
          demoVideoLink: true,
          thumbnailImgURL: true,
          technologiesUsed: true,
          created_at: true,
          user: {
            select: {
              name: true,
              collegeName: true,
            },
          },
          likes: true,
        },
      });

      const modifiedPostsData = postsData
        .map((post) => ({
          ...post,
          user: post.user.name,
          collegeName: post.user.collegeName,
          numLikes: post.likes.length,
        }))
        .sort((a, b) => b.numLikes - a.numLikes)
        .slice(0, 3);

      return res.json({
        status: 200,
        message: "success",
        data: modifiedPostsData,
      });
    }
  } catch (error) {
    res.json({
      status: 500,
      message: "Internal server error, cannot search",
      error: error.message,
    });
  }
};
