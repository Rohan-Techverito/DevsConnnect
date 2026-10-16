import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Components/navbar";
import "./App.css";

import HomePage from "./Pages/homePage";
import Login from "./Pages/login";
import Register from "./Pages/register";
import UploadPost from "./Pages/uploadPost";
import EditPost from "./Pages/EditPost";
import PageNotFound from "./Pages/PageNotFound";
import ExplorePosts from "./Pages/explorePosts";
import DetailPost from "./Pages/DetailPost";
import UserProfile from "./Pages/userProfile";
import PrivateRoute from "./Components/Routes/Private";
import MyUploads from "./Pages/MyUploads";
import ContributionRequests from "./Pages/ContributionRequests";
import Discuss from "./Pages/Discuss";

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="Content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/createPost" element={<PrivateRoute />}>
              <Route path="" element={<UploadPost />} />
            </Route>
            <Route path="/editPost/:id" element={<PrivateRoute />}>
              <Route path="" element={<EditPost />} />
            </Route>
            <Route path="/" element={<PrivateRoute />}>
              <Route path="/myPosts" element={<MyUploads />} />
            </Route>
            <Route path="/" element={<PrivateRoute />}>
              <Route path="/myProfile" element={<UserProfile />} />
            </Route>
            <Route path="/" element={<PrivateRoute />}>
              <Route
                path="/contributionRequests"
                element={<ContributionRequests />}
              />
            </Route>
            <Route path="/" element={<PrivateRoute />}>
              <Route path="/discuss" element={<Discuss />} />
            </Route>
            <Route path="/explorePosts" element={<ExplorePosts />} />
            <Route path="/detailsPost/:id" element={<DetailPost />} />

            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
