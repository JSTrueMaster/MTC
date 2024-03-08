import React, { useState } from "react";
import api from "src/api";
import ProductTable from "src/components/sales/ProductTable";
import changeElementValue from "src/utils/elementvalue"

const Productmanage = () => {
  React.useEffect(() => {
    changeElementValue("subTitle", "店舗一覧");
  }, [])
  return (
    <div className="w-11/12 h-[75%] mx-auto mt-5">
      <ProductTable />
    </div>
  );
};

export default Productmanage;