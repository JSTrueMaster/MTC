
import React, { useContext, useEffect, useState } from "react";
import api from "src/api";
import SafetyMailTable from "src/components/store/SafetyMailTable";
import changeElementValue from "src/utils/elementvalue"
import HomeContext from "src/state/index.context";

const SafetyMail = () => {

  const {
    state: { storeName },
    dispatch: homeDispatch,
  } = useContext(HomeContext);

  React.useEffect(() => {
    changeElementValue("subTitle", "小口・金庫金メール送信");
  }, [])

  return (
    <div className="w-11/12 mx-auto mt-5">
        <SafetyMailTable storeName={storeName} />
    </div>
  );
};

export default SafetyMail;