import React, { useContext, useEffect, useState } from "react";
import api from "src/api";
import CfsTable from "src/components/store/CfsTable";
import changeElementValue from "src/utils/elementvalue"
import HomeContext from "src/state/index.context";

const Cfs = () => {

  const {
    state: { storeName },
    dispatch: homeDispatch,
  } = useContext(HomeContext);

  React.useEffect(() => {
    changeElementValue("subTitle", "CF確認表");
  }, [])
  
  return (
    <div className="w-11/12 h-[75%] mx-auto mt-5">
      <CfsTable storeName={storeName} />
    </div>
  );
};

export default Cfs;