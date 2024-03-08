import React, { useState } from "react";
import api from "src/api";
import ShopmanageTable from "src/components/sales/ShopmanageTable";
import changeElementValue from "src/utils/elementvalue"

const Shopmanage = () => {
  React.useEffect(() => {
    changeElementValue("subTitle", "店舗一覧");
  }, [])
  return (
    <div className="w-11/12 h-[75%] mx-auto mt-5">
      <ShopmanageTable />
    </div>
  );
};

export default Shopmanage;