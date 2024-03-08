import React, { useState } from "react";
import api from "src/api";
import BoardManageTable from "src/components/admin/BoardManageTable";
import changeElementValue from "src/utils/elementvalue"

const AdminBoardmanage = () => {
  React.useEffect(() => {
    changeElementValue("subTitle", "掲示板一覧");
  }, [])
  return (
    <div className="w-11/12 h-[75%] mx-auto mt-5">
      <BoardManageTable />
    </div>
  );
};

export default AdminBoardmanage;