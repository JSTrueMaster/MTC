import React, { useContext, useEffect, useState } from "react";
import api from "src/api";
import ExpensesTable from "src/components/store/ExpensesTable";
import changeElementValue from "src/utils/elementvalue"
import HomeContext from "src/state/index.context";

const Expenses = () => {
  
  const {
    state: { storeName },
    dispatch: homeDispatch,
  } = useContext(HomeContext);

  React.useEffect(() => {
    changeElementValue("subTitle", "経費一覧");
  }, [])
  
  return (
    <div className="w-11/12 h-[75%] mx-auto mt-5">
      <ExpensesTable storeName={storeName} />
    </div>
  );
};

export default Expenses;