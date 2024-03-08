import React, { useState } from "react";
import api from "src/api";
import SalerManageTable from "src/components/admin/SalerManageTable";
import changeElementValue from "src/utils/elementvalue"

const SalerManage = () => {
  React.useEffect(() => {
    changeElementValue("subTitle", "卸先一覧");
  }, [])
  return (
    <div className="w-11/12 h-[75%] mx-auto mt-5">
      <SalerManageTable />
    </div>
  );
};

export default SalerManage;