import React, { useContext, useEffect, useState } from "react";
import api from "src/api";
import SalesTable from "src/components/admin/SalesTable";
import changeElementValue from "src/utils/elementvalue"
import HomeContext from "src/state/index.context";

const Sales = () => {

  const {
    state: { storeName },
    dispatch: homeDispatch,
  } = useContext(HomeContext);

  React.useEffect(() => {
    changeElementValue("subTitle", "売上表");
  }, []);

  // useEffect(() => {
  //   console.log("---Sales Component----");
  //   console.log(storeName);
  // }, [storeName])

  return (
    <div className="sales w-11/12 h-[75%] mx-auto mt-5">
      <SalesTable storeName={storeName} />
    </div>
  );

};

export default Sales;