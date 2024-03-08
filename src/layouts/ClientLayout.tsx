import React, { useEffect, useState } from "react";
import { Outlet, Link, Navigate, Route } from "react-router-dom";
import { ProSidebarProvider, Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
// import 'react-pro-sidebar/dist/css/styles.css';

import Jwt from "src/services/jwt";
import "../global.css";
import DropDown from "../components/DropDown";
import PersonIcon from '@mui/icons-material/Person';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';

const ClientLayout = () => {
  if (!Jwt.token()) return <Navigate to="/auth/login" />
  const logout = () => {
    Jwt.logout();
    window.location.href = "/auth/login";
  }
  const [showDropDown, setShowDropDown] = useState<boolean>(false);
  const toggleDropDown = () => {
    setShowDropDown(!showDropDown);
  };
  const dismissHandler = (event: React.FocusEvent<HTMLButtonElement>): void => {
    if (event.currentTarget === event.target) {
      setShowDropDown(false);
    }
  };

  const [path, setPath] = useState('dashboard')
  useEffect(() => {
    setPath(window.location.pathname)
  }, [])
  const setPathName = () => {
    setTimeout(() => {
      setPath(window.location.pathname)
    }, 100)
  }
  return (
    <ProSidebarProvider>
      <div className="flex flex-row  w-full h-full">

        <div className="bg-white h-screen rounded-l-xl w-[250px]">
          <aside aria-label="Sidebar" className="middleFont">
            <div className="flex items-center text-md font-bold p-4"><img src="/assets/icons/logo.svg" alt="" className="mr-2" />売るナビ業務システム</div>

            <div className="flex h-[90vh] w-full  overflow-y-hidden rounded-0 text-md">
              <Sidebar backgroundColor="#FFFFFF">
                <Menu >
                  {/* <SubMenu label="ダッシュボード"> */}
                  <MenuItem active={path === '/salesmanage'} onClick={() => setPathName()} component={<Link to="/salesmanage" />} className="flex flex-row"><img src="/assets/icons/store.svg" alt="" className="pl-3 pr-1" />店舗管理</MenuItem>
                  <MenuItem active={path === '/productmanage'} onClick={() => setPathName()}  component={<Link to="/productmanage" />} className="flex flex-row"><img src="/assets/icons/product_admin.svg" alt="" className="pl-3 pr-1" />商品管理</MenuItem>
                  <hr className="border-3 border-black-900 mb-2" />
                  <MenuItem active={path === '/access_history'} onClick={() => setPathName()} component={<Link to="/access_history" />} className="flex flex-row divide-x"><img src="/assets/icons/Menu_users.svg" alt="" className="pl-3 pr-1" />アクセス管理</MenuItem>
                  <hr className="border-3 border-black-900 mb-2" />
                  <MenuItem active={path === '/personinfo_change'} onClick={() => setPathName()} component={<Link to="/personinfo_change" />} className="flex flex-row"><img src="/assets/icons/Menu_person.svg" alt="" className="pl-3 pr-1" />個人（社員）情報変更</MenuItem>
                  <MenuItem active={path === '/email_change'} onClick={() => setPathName()} component={<Link to="/email_change" />} className="flex flex-row"><img src="/assets/icons/Menu_mail.svg" alt="" className="pl-3 pr-1" />メールアドレス変更</MenuItem>
                  <MenuItem active={path === '/pwd_change'} onClick={() => setPathName()} component={<Link to="/pwd_change" />} className="flex flex-row"><img src="/assets/icons/user-lock.svg" alt="" className="pl-3 pr-1" />パスワード変更</MenuItem>
                  <MenuItem component={<Link to="" onClick={logout} />} className="flex flex-row"><img src="/assets/icons/sign-out.svg" alt="" className="pl-3 pr-1" />ログアウト</MenuItem>

                  {/* </SubMenu> */}
                </Menu>
              </Sidebar>
            </div>
          </aside>
        </div>
        <div className="flex flex-col bg-background absolute w-[calc(100%-250px)] right-0 h-screen">
          <div className="relative flex flex-row items-center w-[90%] mx-auto mt-10 !mb-0">
            <h1 className="font-meiryo text-lg ml-1" id="subTitle">
              {''}
            </h1>
            <div className="absolute flex justify-end right-0 flex items-center align-middle">
              <button
                className={showDropDown ? "active" : undefined}
                onClick={(): void => toggleDropDown()}
                onBlur={(e: React.FocusEvent<HTMLButtonElement>): void =>
                  dismissHandler(e)
                }
                style={{ padding: 0 }}
              >
                <div className="flex flex-row items-center">
                  <PersonOutlineOutlinedIcon className="w-[32px] h-[32px]" />
                  <p className="largeFont ml-[10px] my-0  text-black">
                    {localStorage.getItem('userName')}
                  </p>
                  <ExpandMoreIcon />
                  {showDropDown && <DropDown showDropDown={false} />}
                </div>
              </button>

            </div>
          </div>
          <hr className="w-[90%] mx-auto border-[#000] opacity-10 my-2" />

          <Outlet />

        </div>

      </div>
    </ProSidebarProvider >
  )
};

export default ClientLayout;
