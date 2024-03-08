import React, { useState } from "react";
import api from "src/api";
import EmployeeManageTable from "src/components/admin/EmployeeManageTable";
import changeElementValue from "src/utils/elementvalue"

const EmployeeManage = () => {
  React.useEffect(() => {
    changeElementValue("subTitle", "社員管理");
  }, [])
  return (
    <div className="w-11/12 h-[75%] mx-auto mt-5">
      <EmployeeManageTable />
    </div>
  );
};

export default EmployeeManage;