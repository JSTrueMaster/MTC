import React, { useState } from "react";
import { Outlet, Link } from "react-router-dom";
import { ProSidebarProvider, Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";

const Layout = () => {
  return (
    <ProSidebarProvider>
      <div className="flex flex-row  w-full h-full">

        <div className="absolute bg-white w-2/12 h-screen rounded-l-xl left-0">
          <aside aria-label="Sidebar">
            <div className="text-xl font-bold py-3 flex "><img src="/assets/icons/logo.svg" alt="" className="pl-3 pr-1" />売るナビ業務システム</div>

            <div className="flex h-full w-full px-3 py-4 overflow-y-auto rounded ">
              <Sidebar backgroundColor="#FFFFFF">
                <Menu >
                  {/* <SubMenu label="ダッシュボード"> */}
                  <MenuItem component={<Link to="/documentation" />} className="flex flex-row font-bold"><img src="/assets/icons/Menu_dashboard.svg" alt="" />ダッシュボード</MenuItem>

                  <MenuItem component={<Link to="/sales" />} className="flex flex-row"><img src="/assets/icons/Menu_sales.svg" alt="" className="pl-3 pr-1" />売上表</MenuItem>
                  <MenuItem component={<Link to="/reports" />} className="flex flex-row"><img src="/assets/icons/Menu_report.svg" alt="" className="pl-3 pr-1" />着地報告</MenuItem>
                  <MenuItem component={<Link to="/cfs" />} className="flex flex-row"><img src="/assets/icons/Menu_Cf.svg" alt="" className="pl-3 pr-1" />CF確認表</MenuItem>
                  <MenuItem component={<Link to="/reports_pl" />} className="flex flex-row"><img src="/assets/icons/Menu_report_pl.svg" alt="" className="pl-3 pr-1" />報告書（PL）</MenuItem>
                  <MenuItem component={<Link to="/expenses" />} className="flex flex-row"><img src="/assets/icons/Menu_list.svg" alt="" className="pl-3 pr-1" />経費一覧</MenuItem>
                  <MenuItem component={<Link to="/confirm" />} className="flex flex-row"><img src="/assets/icons/Menu_confirm.svg" alt="" className="pl-3 pr-1" />小口・金庫金確認表</MenuItem>
                  <MenuItem component={<Link to="/confirm_diff" />} className="flex flex-row"><img src="/assets/icons/Menu_confirm_diff.svg" alt="" className="pl-3 pr-1" />卸先別差異確認表</MenuItem>
                  <MenuItem component={<Link to="/sales" />} className="flex flex-row"><img src="/assets/icons/Menu_confirm_diff.svg" alt="" className="pl-3 pr-1" />入金日別差異確認表</MenuItem>
                  <MenuItem component={<Link to="/documentation" />} className="flex flex-row"><img src="/assets/icons/Menu_Cf.svg" alt="" className="pl-3 pr-1" />小口・金庫金メール貼付</MenuItem>
                  <MenuItem component={<Link to="/documentation" />} className="flex flex-row"><img src="/assets/icons/Menu_Cf.svg" alt="" className="pl-3 pr-1" />着地報告</MenuItem>
                  {/* <MenuItem component={<Link to="/documentation" />} className="flex flex-row"><img src="/assets/icons/Menu_Cf.svg" alt="" className="pl-3 pr-1"/>着地報告</MenuItem> */}
                  {/* <MenuItem component={<Link to="/documentation" />} className="flex flex-row"><img src="/assets/icons/Menu_Cf.svg" alt="" className="pl-3 pr-1"/>着地報告</MenuItem> */}
                  <div className="grid grid-cols-1 !before:border-slate-100 !after:border-slate-100 divide-y">
                    <div></div><div></div>
                  </div>
                  <MenuItem component={<Link to="/person" />} className="flex flex-row"><img src="/assets/icons/Menu_person.svg" alt="" className="pl-3 pr-1" />個人（社員）情報変更</MenuItem>
                  <MenuItem component={<Link to="/mail" />} className="flex flex-row"><img src="/assets/icons/Menu_mail.svg" alt="" className="pl-3 pr-1" />メールアドレス変更</MenuItem>
                  <MenuItem component={<Link to="/pwd" />} className="flex flex-row"><img src="/assets/icons/Menu_pwd.svg" alt="" className="pl-3 pr-1" />パスワード変更</MenuItem>
                  <MenuItem component={<Link to="/users" />} className="flex flex-row"><img src="/assets/icons/Menu_users.svg" alt="" className="pl-3 pr-1" />ユーザー管理</MenuItem>
                  <MenuItem component={<Link to="/logout" />} className="flex flex-row"><img src="/assets/icons/Menu_logout.svg" alt="" className="pl-3 pr-1" />ログアウト</MenuItem>

                  {/* </SubMenu> */}
                </Menu>
              </Sidebar>
            </div>
          </aside>
        </div>

        <div className="absolute flex flex-col bg-background w-10/12 right-0 h-screen">
          <div className="flex flex-row justify-between w-10/12 mx-auto mt-10 mb-2">
            <h1 className="font-meiryo text-lg">
              {'売上管理'}
            </h1>
            <div>
              <button id="dropdownAvatarNameButton" data-dropdown-toggle="dropdownAvatarName" className="flex items-center text-sm font-medium text-gray-900 rounded-full hover:text-blue-600 md:mr-0 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:text-white" type="button">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="9" r="5" stroke="#464646" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <ellipse cx="16" cy="22.5" rx="9" ry="5.5" stroke="#464646" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                秀樹
                <svg className="w-4 h-4 mx-1.5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
                </svg>
              </button>

              <div id="dropdownAvatarName" className="absolute hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 dark:divide-gray-600 z-[9999] mt-2">
                <div className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                  <div className="font-medium ">Pro User</div>
                  <div className="truncate">name@flowbite.com</div>
                </div>
                <ul className="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownInformdropdownAvatarNameButtonationButton">
                  <li>
                    <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Dashboard</a>
                  </li>
                  <li>
                    <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Settings</a>
                  </li>
                  <li>
                    <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Earnings</a>
                  </li>
                </ul>
                <div className="py-2">
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">Sign out</a>
                </div>
              </div>

            </div>
          </div>

          <hr className="w-10/12 mx-auto opacity-10 " />

          <Outlet />

        </div>

      </div>
    </ProSidebarProvider>
  )
};

export default Layout;
