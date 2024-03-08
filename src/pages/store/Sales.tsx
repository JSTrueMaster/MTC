import React, { useContext, useEffect, useState } from "react";
import api from "src/api";
import SalesTable from "src/components/store/SalesTable";
import changeElementValue from "src/utils/elementvalue"
import HomeContext from "src/state/index.context";

const Sales = () => {
    
  const {
    state: { storeName },
    dispatch: homeDispatch,
  } = useContext(HomeContext);

  React.useEffect(() => {
    console.log(storeName)
    changeElementValue("subTitle", "売上表");
  }, []);

  return (
    <div className="sales w-11/12 h-[70%] mx-auto mt-4">
      <SalesTable storeName={storeName} />
    </div>
  );
};

export default Sales;