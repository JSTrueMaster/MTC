import Api from "./api";
import React, { StrictMode, useEffect, useState } from 'react'
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, RoutesProps } from "react-router-dom";
//add layout & main style
import AppLayout from "./layouts/AppLayout";
import EmployeeLayout from "./layouts/EmployeeLayout";
import AdminLayout from "./layouts/AdminLayout";
import ClientLayout from "./layouts/ClientLayout";
import AuthLayout from "./layouts/AuthLayout";
//add Salespages
import Sales from "./pages/store/Sales";
import Dashboard from "./pages/store/Dashboard";
import Report from "./pages/store/Report";
import Employee from "./pages/common/Employee";
import PersoninfoChange from "./pages/common/PersoninfoChange";
import NoPage from "./pages/NoPage";
import Login from "./pages/auth/login";
import ForgotPassword from "./pages/auth/forgot-password";
import ResetPassword from "./pages/auth/reset-password";
import EmailChange from "./pages/common/EmailChange";
import EmailChangeActivate from "./pages/common/EmailChangeActivate";
import PwdChange from "./pages/common/PwdChange";
import AccessHistory from "./pages/common/AccessHistory";
import Cfs from "./pages/store/Cfs";
import Diff from "./pages/store/Diff";
import DepositDiff from "./pages/store/DepositDiff"
import Expenses from "./pages/store/Expenses";
import Safety from "./pages/store/Safety";
import SafetyMail from "./pages/store/SafetyMail";
import DailyCheck from "./pages/store/DailyCheck";
import LReportMail from "./pages/store/LReportMail";

// add Store Pages
import Salesmanage from "./pages/sales/Shopmanage"
import Productmanage from "./pages/sales/Productmanage"

// add Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminSales from "./pages/admin/Sales";
import AdminReport from "./pages/admin/Report";
import AdminExpenses from "./pages/admin/Expenses";
import AdminCfs from "./pages/admin/Cfs";

import ShopManage from "./pages/admin/ShopManage";
import SalerManage from "./pages/admin/SalerManage";
import AdminManage from "./pages/admin/AdminManage";
import EmployeeManage from "./pages/admin/EmployeeManage";
import MasterManage from "./pages/admin/MasterManage";
import BoardManage from "./pages/admin/BoardManage";

import HomeContext from './state/index.context';
import { useCreateReducer } from './hooks/useCreateReducer';
import { initialState, HomeInitialState } from './state/index.state';

export default function App() {

  const [authenticated, setAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState("");
  let token = localStorage.getItem('token');

  const fetchUser = () => {
    Api.user.fetchUser().then((response: any) => {
      setUserRole(response.data.role)
      localStorage.setItem('userRole', response.data.role)
      if (response.data.role) setAuthenticated(true)
    }).catch((error: any) =>{
      token = null;
      localStorage.removeItem("token");
      window.location.href = '/auth/login';
    })
  }
  const contextValue = useCreateReducer<HomeInitialState>({
    initialState,
  });

  useEffect(() => {

    if (token) {

      fetchUser();

      if (window.location.pathname == '/auth/login')
        window.location.href = '/dashboard';

    } else {
      if (
        window.location.pathname != '/auth/login' &&
        window.location.pathname != '/auth/forgot-password'
      )
        window.location.href = '/auth/login';
    }

  }, [])

  return (
    <HomeContext.Provider
        value={{
          ...contextValue,
        }}>
    <BrowserRouter>
      <Routes>
        <Route path='/email_change_activate' element={<EmailChangeActivate />} />
        {(!authenticated) && (
          <>
            <Route path="/" element={<Navigate to="/auth/login" />} />
            <Route path="/auth" element={<AuthLayout />}>
              <Route path='login' element={<Login />} />
              <Route path='forgot-password' element={<ForgotPassword />} />
              <Route path='reset-password' element={<ResetPassword />} />
            </Route>
          </>
        )}

        {(authenticated && (userRole == 'user' || userRole == 'employee')) && (
          <>
            <Route path="/" element={userRole == 'user' ? <AppLayout /> : <EmployeeLayout />}>
              <Route path='auth/login' element={<Dashboard />} />
              <Route path='dashboard' element={<Dashboard />} />
              <Route path='sales' element={<Sales />} />
              <Route path='reports_pl' element={<Report />} />
              <Route path='sale_admin' element={<Employee />} />
              <Route path='personinfo_change' element={<PersoninfoChange />} />
              <Route path='email_change' element={<EmailChange />} />
              <Route path='pwd_change' element={<PwdChange />} />
              <Route path='access_history' element={<AccessHistory />} />
              <Route path='cfs' element={<Cfs />} />
              <Route path='diff' element={<Diff />} />
              <Route path='deposit_diff' element={<DepositDiff />} />
              <Route path='expenses' element={<Expenses />} />
              <Route path='daily_check' element={<DailyCheck />} />
              <Route path='report_mail' element={<LReportMail />} />
              <Route path='safety' element={<Safety />} />
              <Route path='safety_mail' element={<SafetyMail />} />
              <Route path="*" element={<NoPage />} />
            </Route>
          </>
        )}
        {(authenticated && (userRole == 'admin' || userRole == 'super_admin')) && (
          <>
            <Route path="/" element={<AdminLayout />}>
              <Route path="/dashboard" element={<AdminDashboard />} />
              <Route path='sales' element={<AdminSales />} />
              <Route path='reports_pl' element={<AdminReport />} />
              <Route path='expenses' element={<AdminExpenses />} />
              <Route path='cfs' element={<AdminCfs />} />

              <Route path="shopmanage" element={<ShopManage />} />
              <Route path='salermanage' element={<SalerManage />} />
              <Route path='adminmanage' element={<AdminManage />} />
              <Route path='employeemanage' element={<EmployeeManage />} />
              <Route path='mastermanage' element={<MasterManage />} />
              <Route path='boardmanage' element={<BoardManage />} />

              <Route path='access_history' element={<AccessHistory />} />
              <Route path='personinfo_change' element={<PersoninfoChange />} />
              <Route path='email_change' element={<EmailChange />} />
              <Route path='pwd_change' element={<PwdChange />} />
              <Route path="*" element={<NoPage />} />
            </Route>
          </>
        )}
        {(authenticated && userRole == 'client') && (
          <>
            <Route path="/dashboard" element={<Navigate to="/salesmanage" />} />
            <Route path="/" element={<ClientLayout />}>
              <Route path="salesmanage" element={<Salesmanage />} />
              <Route path='productmanage' element={<Productmanage
              />} />
              <Route path='access_history' element={<AccessHistory />} />
              <Route path='personinfo_change' element={<PersoninfoChange />} />
              <Route path='email_change' element={<EmailChange />} />
              <Route path='pwd_change' element={<PwdChange />} />
            </Route>
          </>
        )}
        <Route path="*" element={<div className="loading" />} />
      </Routes>
    </BrowserRouter>
    </HomeContext.Provider>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);






// let inputValue = '';

// document.addEventListener("keydown", (event) => {
//   // event.preventDefault(); // prevent the default behavior of the space key    

//   if (event.code === "Enter" || event.code === "NumberEnter") {

//     const inputElement = event.target as HTMLInputElement;
//     console.log('enter :', inputElement.value);
//     inputElement.value = inputValue;

//     //copy text
//     const range = document.createRange();
//     range.selectNode(inputElement);

//     const selection = window.getSelection();
//     selection.addRange(range);
//     selection.removeAllRanges();

//     document.execCommand("copy");
//     selection.removeAllRanges();

//     //past text
//     document.execCommand("paste");

//   }

// });

// document.addEventListener("focusin", (event) => {

//   event.preventDefault(); // prevent the default behavior of the space key
  
//   const inputElement = event.target as HTMLInputElement;
//   console.log('focusin :', inputElement.value);
//   inputElement.value = inputValue;
//   //copy text
//   const range = document.createRange();
//   range.selectNode(inputElement);

//   const selection = window.getSelection();
//   selection.addRange(range);
//   selection.removeAllRanges();

//   document.execCommand("copy");
//   selection.removeAllRanges();

//   //past text
//   document.execCommand("paste");

// });

// document.addEventListener("compositionend", (event) => {

//   // event.preventDefault(); // prevent the default behavior of the space key    
//   const inputElement = event.target as HTMLInputElement;
//   console.log('compositionend :', inputElement.value);
//   inputElement.value = inputValue;

//   if (event.target instanceof HTMLInputElement) {

//     // inputElement.value = inputValue;

//     // //copy text
//     // const range = document.createRange();
//     // range.selectNode(inputElement);

//     // const selection = window.getSelection();
//     // selection.addRange(range);
//     // selection.removeAllRanges();

//     // document.execCommand("copy");
//     // selection.removeAllRanges();

//     // //past text
//     // document.execCommand("paste");

//     // Create a new change event
//     const changeEvent = new Event('change', { bubbles: true });
//     // Dispatch the change event
//     inputElement.dispatchEvent(changeEvent);
//   }
// });