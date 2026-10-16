import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Avatar, Button, Image, List, Rate, Tag } from "antd";
import axios from "axios";
import Spinner from "../Components/Spinner";
import { FaGithub, FaHeart } from "react-icons/fa";
import { MdOndemandVideo } from "react-icons/md";
import { VscLiveShare } from "react-icons/vsc";
import RequestContribModal from "../Components/RequestContribModal";
import { useAuth } from "../contexts/authContext";
import { FaCodeMerge } from "react-icons/fa6";
import dayjs from "dayjs";

const DetailPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [auth] = useAuth();
  const [postData, setPostData] = useState(null);
  const [ContributionRequestStatus, setContributionRequestStatus] = useState(1);
  const [open, setOpen] = useState(false);

  const tagColors = [
    "red",
    "orange",
    "yellow",
    "green",
    "blue",
    "purple",
    "pink",
    "gray",
    "cyan",
    "magenta",
  ];

  useEffect(() => {
    async function fetchData() {
      try {
        const { data } = await axios.get(`/api/v1/posts/getPost/${id}`, {
          //  params: { currentUserId: auth?.user?.id },
        });
        if (data?.status === 200) {
          setPostData(data?.data);
          setContributionRequestStatus(
            data.data[0].contributionRequests?.length
          );
        }
      } catch (error) {
        console.log(error);
      }
    }
    fetchData();
  }, [id]);

  return (
    <div className="container mx-auto mt-8">
      {postData ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="flex justify-center">
              <Image
                width={600}
                src={`${import.meta.env.VITE_REACT_APP_API}${
                  postData?.thumbnailImgURL?.split("/")?.length > 1
                    ? postData?.thumbnailImgURL
                    : "/uploads/default.gif"
                }`}
                className="max-w-full h-auto lg:max-w-lg"
              />
            </div>
            <div className="p-2">
              <h2 className="text-2xl font-bold mb-4">
                <>{postData?.name}</>
              </h2>
              <p className="text-gray-600 mb-4">{postData?.description}</p>
              <div className="flex items-center mb-4">
                <span className="font-semibold mr-2">Uploaded By:</span>
                <span>{postData?.user}</span>
              </div>
              <div className="flex items-center mb-4">
                <span className="font-semibold mr-2">College Name:</span>
                <span>{postData?.collegeName}</span>
              </div>
              {Number(auth?.user?.id) === postData.userId && (
                <div className="flex items-center mb-4">
                  <Button
                    type="primary"
                    onClick={() => navigate(`/editPost/${id}`)}
                  >
                    Edit Post
                  </Button>
                </div>
              )}
              <div className="flex justify-start items-center">
                <FaHeart
                  key={"liked"}
                  className="text-red-600 mx-2"
                  size={23}
                />
                <span className="mx-1">{postData?.likes?.length}</span>
              </div>

              <div className="flex items-center mb-4">
                <span className="font-semibold mr-2">Technologies Used:</span>
                <div className="flex flex-wrap">
                  {postData?.technologiesUsed?.map((item, i) => (
                    <Tag
                      key={i}
                      color={
                        tagColors[Math.floor(Math.random() * tagColors.length)]
                      }
                      className="m-1 p-2"
                    >
                      {item.toUpperCase().trim()}
                    </Tag>
                  ))}
                </div>
              </div>
              <div className="flex justify-center sm:flex-wrap lg:justify-center p-10">
                <Link
                  to={postData?.gitHubLink}
                  className="mr-4 sm:mr-0 sm:mb-4 lg:mr-4 lg:mb-0"
                >
                  <Tag
                    className="p-3 w-36"
                    icon={<FaGithub size={20} />}
                    color="black"
                  >
                    GITHUB
                  </Tag>
                </Link>
                <Link
                  to={postData?.demoVideoLink}
                  className="mr-4 sm:mr-0 sm:mb-4 lg:mr-4 lg:mb-0"
                >
                  <Tag
                    className="p-3 w-36"
                    icon={<MdOndemandVideo size={20} />}
                    color="#55acee"
                  >
                    DEMO VIDEO
                  </Tag>
                </Link>

                <Link to={postData?.deployedLink}>
                  <Tag
                    className="p-3 w-36"
                    icon={<VscLiveShare size={20} />}
                    color="indigo"
                  >
                    DEPLOYED URL
                  </Tag>
                </Link>
              </div>
            </div>
          </div>
          <div className="p-5 border-2 m-5 rounded-lg shadow-lg">
            <div className="drop-shadow-xl mb-5 text-lg font-semibold text-gray-700 flex justify-center items-center">
              <FaCodeMerge className="mx-4 text-green-300" size={25} />
              <span>CONTRIBUTORS OF {postData?.name?.toUpperCase()}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {postData.contributionRequests?.map((item, index) => (
                <div
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                  key={index}
                >
                  <div className="flex items-center p-4">
                    <Avatar
                      className="drop-shadow-2xl"
                      style={{
                        backgroundColor: "#fde3cf",
                        color: "#f56a00",
                        padding: "10px",
                      }}
                    >
                      {item?.requester?.name?.slice(0, 1)?.toUpperCase()}
                    </Avatar>
                    <div className="ml-3">
                      <p className="font-semibold">{item?.requester?.name}</p>
                      <p className="text-gray-500 text-sm">
                        {dayjs(item?.created_at)?.format("DD-MM-YYYY")}
                      </p>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="font-semibold">Worked On:</p>
                    <p>{item?.wishesToWorkOn}</p>
                    <p className="font-semibold mt-2">College name:</p>
                    <p>{item?.requester?.collegeName}</p>
                  </div>
                  <div className="p-4 border-t flex items-center justify-between">
                    <span className="text-gray-500 text-sm">Rating:</span>
                    <Rate disabled value={item?.rating} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="flex justify-center items-center h-screen">
          <Spinner Size={50} />
        </div>
      )}
      <div>
        <RequestContribModal
          open={open}
          setOpen={setOpen}
          postData={postData}
          setContributionRequestStatus={setContributionRequestStatus}
        />
      </div>
    </div>
  );
};

export default DetailPost;
