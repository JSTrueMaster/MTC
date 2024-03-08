import React, { useState } from "react";
import api from "src/api";
import ShopManageTable from "src/components/admin/ShopManageTable";
import changeElementValue from "src/utils/elementvalue"

const ShopManage = () => {
  React.useEffect(() => {
    changeElementValue("subTitle", "店舗管理");
  }, [])
  return (
    <div className="w-11/12 h-[75%] mx-auto mt-5">
      <ShopManageTable />
    </div>
  );
};

export default ShopManage;