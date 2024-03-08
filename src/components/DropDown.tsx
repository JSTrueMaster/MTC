import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Jwt from "src/services/jwt";

type DropDownProps = {
  showDropDown: boolean;

};

const DropDown: React.FC<DropDownProps> = (DropDownProps): JSX.Element => {
  const [showDropDown, setShowDropDown] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleClick = (url: string) => {
    navigate(url);
  }

  const logout = () => {
    Jwt.logout();
    window.location.href = "/auth/login";
  }

  useEffect(() => {
    setShowDropDown(showDropDown);
  }, [showDropDown]);

  return (
    <>
      <div className={showDropDown ? "dropdown" : "dropdown active absolute z-[9999] !left-[-84px] "} >
        <p onClick={() => handleClick("personinfo_change")} className="flex flex-row"><img src="/assets/icons/user-edit.svg" alt="" className="float-left " />個人（社員）情報変更</p>
        <p onClick={() => handleClick("email_change")} className="flex flex-row"><img src="/assets/icons/mail-bulk.svg" alt="" className="float-left " />メールアドレス変更</p>
        <p onClick={() => handleClick("pwd_change")} className="flex flex-row"><img src="/assets/icons/user-lock.svg" alt="" className="float-left " />パスワード変更</p>
        <p onClick={logout} className="flex flex-row"><img src="/assets/icons/sign-out.svg" alt="" className="float-left " />ログアウト</p>
      </div>
    </>
  );
};

export default DropDown;
