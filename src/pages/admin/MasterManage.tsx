import React, { useState } from "react";
import api from "src/api";
import MasterManageTable from "src/components/admin/MasterManageTable";
import changeElementValue from "src/utils/elementvalue"

const MasterManage = () => {
  React.useEffect(() => {
    changeElementValue("subTitle", "マスタ一覧");
  }, [])
  return (
    <div className="w-11/12 h-[75%] mx-auto mt-5">
      <MasterManageTable />
    </div>
  );
};

export default MasterManage;