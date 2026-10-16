import { Button, Form, Input, Select, Tag } from "antd";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaLaptopCode, FaUpload } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import urlRegex from "url-regex";
import { DiGithubBadge } from "react-icons/di";
import Spinner from "../Components/Spinner";

const techOptions = [
  { label: "REACT", value: "React" },
  { label: "NODE.JS", value: "NODE.JS" },
  { label: "EXPRESS", value: "EXPRESS" },
  { label: "MONGODB", value: "MONGODB" },
  { label: "SQL", value: "SQL" },
  { label: "JAVASCRIPT", value: "JAVASCRIPT" },
  { label: "HTML", value: "HTML" },
  { label: "CSS", value: "CSS" },
  { label: "PYTHON", value: "PYTHON" },
  { label: "DJANGO", value: "DJANGO" },
  { label: "FLASK", value: "FLASK" },
  { label: "JAVA", value: "JAVA" },
  { label: "SPRING BOOT", value: "SPRING BOOT" },
  { label: "C++", value: "C++" },
  { label: "C#", value: "C#" },
  { label: ".NET", value: ".NET" },
  { label: "RUBY", value: "RUBY" },
  { label: "RUBY ON RAILS", value: "RUBY ON RAILS" },
  { label: "PHP", value: "PHP" },
  { label: "LARAVEL", value: "LARAVEL" },
  { label: "SWIFT", value: "SWIFT" },
  { label: "KOTLIN", value: "KOTLIN" },
  { label: "FLUTTER", value: "FLUTTER" },
  { label: "REACT NATIVE", value: "REACT NATIVE" },
  { label: "ANGULAR", value: "ANGULAR" },
  { label: "VUE.JS", value: "VUE.JS" },
];

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [techList, setTechList] = useState([]);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data } = await axios.get(`/api/v1/posts/getPost/${id}`);
        if (data?.status === 200 && data?.data) {
          const post = data.data;
          form.setFieldsValue({
            Title: post.name,
            Description: post.description,
            gitHubLink: post.gitHubLink,
            deployedLink: post.deployedLink,
            demoVideoLink: post.demoVideoLink,
            technologiesUsed: post.technologiesUsed || [],
          });
          setTechList(post.technologiesUsed || []);
          setNotFound(false);
        } else if (data?.status === 404 || data?.data == null) {
          setNotFound(true);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, form]);

  const tagColors = [
    "magenta",
    "red",
    "volcano",
    "orange",
    "gold",
    "lime",
    "green",
    "cyan",
    "blue",
    "geekblue",
    "purple",
  ];

  const onFinish = async (values) => {
    try {
      if (techList.length === 0) {
        toast("Select at least one technology", {
          icon: <FaLaptopCode size={25} className="text-blue-500" />,
        });
        return;
      }
      if (!urlRegex().test(values.gitHubLink)) {
        toast("Please enter a valid URL", {
          icon: <DiGithubBadge size={25} className="text-blue-500" />,
        });
        return;
      }

      const { data } = await axios.patch(`/api/v1/posts/updatePost/${id}`, {
        Title: values.Title,
        Description: values.Description,
        gitHubLink: values.gitHubLink,
        deployedLink: values.deployedLink || "",
        demoVideoLink: values.demoVideoLink || "",
        technologiesUsed: techList,
      });

      if (data?.status === 200) {
        toast.success("Post updated");
        navigate(`/detailsPost/${id}`);
      } else {
        toast.error(data?.message || "Error updating post");
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Error updating post");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner Size={50} />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl font-semibold text-gray-600">Post not found</p>
      </div>
    );
  }

  return (
    <>
      <div className="mt-6">
        <h1 className="text-center text-xl text-gray-900 font-bold font-mono">
          EDIT POST
        </h1>
        <div className=" mt-4 w-screen border-t-2 border-gray-400"></div>

        <Form
          layout="vertical"
          size="large"
          className="p-10"
          form={form}
          onFinish={onFinish}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-white rounded-lg shadow-lg">
            <div>
              <Form.Item
                label="Project Title"
                name="Title"
                rules={[
                  {
                    required: true,
                    whitespace: true,
                    message: "Project Title is required",
                  },
                ]}
              >
                <Input placeholder="Enter title of your project" />
              </Form.Item>
              <Form.Item name="technologiesUsed" label="Technologies Used">
                <Select
                  placeholder="Select the technologies used in your project"
                  mode="multiple"
                  showArrow
                  tagRender={(props) => (
                    <Tag
                      className="p-1 text-md m-2"
                      color={
                        tagColors[(props.value?.length || 0) % tagColors.length]
                      }
                      closable={true}
                      onClose={props.onClose}
                      style={{
                        marginRight: 3,
                      }}
                    >
                      {props.label}
                    </Tag>
                  )}
                  optionLabelProp="label"
                  options={techOptions}
                  onChange={(value) => setTechList(value)}
                />
              </Form.Item>
            </div>
            <div>
              <Form.Item
                label="Project Description"
                name="Description"
                rules={[
                  {
                    required: true,
                    whitespace: true,
                    message: "Project Description is required",
                  },
                ]}
              >
                <Input.TextArea
                  placeholder="Describe in short what your project is about..."
                  rows={5}
                />
              </Form.Item>

              <Form.Item
                label="Deployed URL (if available)"
                name="deployedLink"
              >
                <Input placeholder="Paste URL of your project deployed " />
              </Form.Item>
              <Form.Item label="Demo Video URL" name="demoVideoLink">
                <Input placeholder="Do you have Demo Video?" />
              </Form.Item>
              <Form.Item
                label="GitHub Repository URL"
                name="gitHubLink"
                rules={[
                  {
                    required: true,
                    whitespace: true,
                    message: "GitHub Repository URL is required",
                  },
                  {
                    validator: (_, value) => {
                      if (value && urlRegex().test(value)) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("Please enter a valid URL")
                      );
                    },
                  },
                ]}
              >
                <Input placeholder="Paste your GitHub repository URL" />
              </Form.Item>
              <Form.Item className="my-6 flex justify-center py-4 ">
                <Button
                  htmlType="submit"
                  className="bg-blue-600 text-white hover:bg-blue-400  "
                  icon={<FaUpload className="mr-2" />}
                >
                  Update Project
                </Button>
              </Form.Item>
            </div>
          </div>
        </Form>
      </div>
    </>
  );
};

export default EditPost;
