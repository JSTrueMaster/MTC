import React, { useState } from "react";
import { Outlet, Link } from "react-router-dom";
import { ProSidebarProvider, Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";

const Layout = () => {
  return (
      <div className="auth-container">
        <Outlet />
      </div>
  )
};

export default Layout;
