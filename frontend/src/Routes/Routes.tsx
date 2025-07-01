import React from "react";
import { Routes, Route } from "react-router-dom";

import PageNotFound from "../pages/PageNotFound";
import Homepage from "../pages/Homepage/Homepage";
import Login from "../components/Auth/Login";
import RegistrationForm from "../components/Auth/Register";
import PrivateRoute from "./PrivateRoutes";
import MyProfile from "../components/Homepage/MyProfile";
import PostInfo from "@/components/Homepage/PostInfo";
import MyBookmarks from "@/pages/MyBookmarks";

const RoutesPath = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<RegistrationForm />} />

      <Route element={<PrivateRoute />}>
        <Route path="/" element={<Homepage />} />
        <Route path="/bookmarks" element={<MyBookmarks />} />

      </Route>

      <Route path="/profile/:userName" element={<MyProfile />} />
      <Route path="/post/:id" element={<PostInfo />} />

       



      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

export default RoutesPath;
