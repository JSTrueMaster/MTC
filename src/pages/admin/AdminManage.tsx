import React, { useState } from "react";
import api from "src/api";
import AdminManageTable from "src/components/admin/AdminManageTable";
import changeElementValue from "src/utils/elementvalue"

const AdminManage = () => {
  React.useEffect(() => {
    changeElementValue("subTitle", "管理者一覧");
  }, [])
  return (
    <div className="w-11/12 h-[75%] mx-auto mt-5">
      <AdminManageTable />
    </div>
  );
};

export default AdminManage;