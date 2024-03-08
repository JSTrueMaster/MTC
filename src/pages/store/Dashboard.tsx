import React, { useContext, useEffect, useState } from "react";
import api from "src/api";
import { IMAGE_PATH } from "src/configs/AppConfig";
import changeElementValue from "src/utils/elementvalue"
import SalesTableOfDashboard from "src/components/store/SalesTableOfDashboard";
import SalesInsertTableOfDashboard from "src/components/store/SalesInsertTableOfDashboard";
import PreciousMetalOfDashboard from "src/components/store/PreciousMetalOfDashboard";
import SalesclientOfDashboard from "src/components/store/SalesclientOfDashboard";
import SalesStampOfDashboard from "src/components/store/SalesStampOfDashboard";
import SalesOldCoinOfDashboard from "src/components/store/SalesOldCoinOfDashboard";
import SalesCellphoneOfDashboard from "src/components/store/SalesCellphoneOfDashboard";
import SalesOthersOfDashboard from "src/components/store/SalesOthersOfDashboard";
import SalesIntroOfDashboard from "src/components/store/SalesIntroOfDashboard";
import SalesFrontstoreOfDashboard from "src/components/store/SalesFrontstoreOfDashboard";
import SalesHPOfDashboard from "src/components/store/SalesHPOfDashboard";
import SalesInsertOfDashboard from "src/components/store/SalesInsertOfDashboard";
import SalesVouchersOfDashboard from "src/components/store/SalesVouchersOfDashboard";

import HomeContext from "src/state/index.context";

const Dashboard = () => {
    const [board, setBoard] = useState([] as any);
    const [boardList, setBoardList] = useState([] as any);
    const [boardDate, setBoardDate] = useState('');

    const {
        state: { storeName },
        dispatch: homeDispatch,
    } = useContext(HomeContext);

    React.useEffect(() => {
        changeElementValue("subTitle", "ダッシュボード");

        const fetchData = async () => {

            const res = await api.client.getStoreBoard({ storeName: storeName == '' ? localStorage.getItem('storeName').split(",")[0] : storeName });

            if (res.data.data.length == 0) {
                setBoardList([]);
                return;
            }

            setBoardList(res.data.data);

            const isoDateString = res.data.data[0].日付;
            const isoDate = new Date(isoDateString);
            const formattedDate = `${isoDate.getFullYear()}年${(isoDate.getMonth() + 1).toString()}月${isoDate.getDate()}日`;

            setBoard({
                'no': 1,
                'title': res.data.data[0].タイトル,
                'date': formattedDate,
                'image': res.data.data[0].画像,
                'content': res.data.data[0].本文,
            })
        };
        fetchData();
    }, [storeName])

    return (
        <div className="w-full mx-auto !h-full mt-5 overflow-y-auto">
            <div className="w-11/12 mx-auto">
                {/* 掲示板情報 */}
                <div className="mx-auto p-[30px] bg-white rounded-[10px]">
                    <div className="w-[30%] border-solid border-[#808080] border-b-[2px] border-t-0 border-r-0 border-l-0">
                        <p className="leading-[120%] ">掲示板情報</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 p-0 font-normal text-[#575757] text-[14px] leading-[24px] mt-[30px]">
                        <div className="max-h-[400px] overflow-auto">
                            <div className="p-7px">
                                {
                                    boardList.map((item: any, index: number) => {

                                        const isoDateString = item.日付;
                                        const isoDate = new Date(isoDateString);
                                        const formattedDate = `${isoDate.getFullYear()}年${(isoDate.getMonth() + 1).toString()}月${isoDate.getDate()}日`;
                                        return (
                                            <div key={index} className={`grid grid-cols-8 w-[100%] border-solid border-[#808080] border-b-[1px] border-t-0 border-r-0 border-l-0 p-[7px] cursor-pointer ${board.no == (index + 1) ? 'text-[#1DAEFF]' : ''}`}
                                                onClick={() => {
                                                    setBoard({
                                                        'no': (index + 1),
                                                        'title': item.タイトル,
                                                        'date': formattedDate,
                                                        'image': item.画像,
                                                        'content': item.本文,
                                                    })
                                                }}>
                                                <div className="w-[92px]">{formattedDate.split('年')[1]} </div>
                                                <div className="col-span-7"> {item.タイトル}</div>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </div>
                        {boardList.length > 0 &&
                            <div className="max-h-[400px] overflow-auto">
                                <div className="p-[7px]">
                                    <p>{board.title}</p>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 right-0">{board.date}</div>
                                    </div>
                                    <div>
                                        <img
                                            src={`${IMAGE_PATH}${board.image}`}
                                            alt=""
                                            className="w-[100%] h-[242px] mx-auto mt-5"
                                        />
                                    </div>
                                    <div className="mx-auto mt-10">
                                        <p>{board.content}</p>
                                    </div>
                                </div>
                            </div>}
                    </div>
                </div>
                {/* <掲示板情報 end /> */}
                <div className="mt-5">
                    <SalesTableOfDashboard storeName={storeName} />
                </div>
                <div className="grid grid-cols-2 gap-4 p-0 font-normal text-[#575757] text-[14px] leading-[24px] mt-[30px]">
                    <div>
                        <SalesInsertTableOfDashboard storeName={storeName} />
                    </div>
                    <div>
                        <PreciousMetalOfDashboard storeName={storeName} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 p-0 font-normal text-[#575757] text-[14px] leading-[24px] mt-[30px]">
                    <div>
                        <SalesclientOfDashboard storeName={storeName} />
                    </div>
                    <div>
                        <SalesIntroOfDashboard storeName={storeName} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 p-0 font-normal text-[#575757] text-[14px] leading-[24px] mt-[30px]">
                    <div>
                        <SalesStampOfDashboard storeName={storeName} />
                    </div>
                    <div>
                        <SalesFrontstoreOfDashboard storeName={storeName} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 p-0 font-normal text-[#575757] text-[14px] leading-[24px] mt-[30px]">
                    <div>
                        <SalesOldCoinOfDashboard storeName={storeName} />
                    </div>
                    <div>
                        <SalesHPOfDashboard storeName={storeName} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 p-0 font-normal text-[#575757] text-[14px] leading-[24px] mt-[30px]">
                    <div>
                        <SalesCellphoneOfDashboard storeName={storeName} />
                    </div>
                    <div>
                        <SalesVouchersOfDashboard storeName={storeName} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 p-0 font-normal text-[#575757] text-[14px] leading-[24px] mt-[30px]">
                    <div>
                        <SalesOthersOfDashboard storeName={storeName} />
                    </div>
                    <div>
                        <SalesInsertOfDashboard storeName={storeName} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;