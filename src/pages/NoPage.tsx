import React from "react";
import changeElementValue from "src/utils/elementvalue"

const NoPage = () => {

  React.useEffect(() => {
    changeElementValue("subTitle", "");
  }, [])

  return (
    <div className="flex w-[90%] h-screen items-center justify-center">
      <h4>権限が付与されていません。管理者に連絡してください。</h4>
    </div>
  );
};

export default NoPage;