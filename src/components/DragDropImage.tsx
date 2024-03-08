
import React, { useEffect, useState } from "react";
import shortid from "shortid";

// drag drop file component
const DragDropImage = (props: any) => {

  const [selectedfile, SetSelectedFile] = useState([]);
  const [Files, SetFiles] = useState([]);


  const filesizes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  useEffect(() => {
    props.value(selectedfile)
  }, [selectedfile])

  const InputChange = (e: any) => {
    // --For Multiple File Input
    let images = [];
    for (let i = 0; i < e.target.files.length; i++) {
      images.push((e.target.files[i]));
      let reader = new FileReader();
      let file = e.target.files[i];
      reader.onloadend = () => {
        SetSelectedFile((preValue) => {
          return [
            ...preValue,
            {
              id: shortid.generate(),
              filename: e.target.files[i].name,
              filetype: e.target.files[i].type,
              fileimage: reader.result,
              datetime: e.target.files[i].lastModifiedDate.toLocaleString('en-IN'),
              filesize: filesizes(e.target.files[i].size),
              // file: e.target.files[i],
            }
          ]
        });
      }
      if (e.target.files[i]) {
        reader.readAsDataURL(file);
      }
    }
  }


  const DeleteSelectFile = (id: number) => {
    const result = selectedfile.filter((data) => data.id !== id);
    SetSelectedFile(result);
  }

  const FileUploadSubmit = async (e: any) => {
    e.preventDefault();

    // form reset on submit 
    e.target.reset();
    if (selectedfile.length > 0) {
      for (let index = 0; index < selectedfile.length; index++) {
        SetFiles((preValue) => {
          return [
            ...preValue,
            selectedfile[index]
          ]
        })
      }
      SetSelectedFile([]);
    } else {
      alert('Please select file')
    }
  }

  return (
    <div className="fileupload-view">
      <div className="row justify-content-center m-0">
        <div className="col-md-6">
          <div className="card mt-5">
            <div className="card-body">
              <div className="kb-data-box">
                <form>
                  <div className="kb-file-upload">
                    <div className="flex flex-col file-upload-box">
                      <img src="assets/icons/Upload.svg" />
                      <input type="file" id="fileupload" className="file-upload-input" onChange={InputChange} multiple />
                      <span className='my-2'>ファイルのドラッグ＆ドロップ また<span className="file-link">はブラウズ</span></span>
                      <span className='text-[12px] text-[#4D4D4D] font-Meiryo'>対応フォーマット JPG、JPEG、PNG、GIF、SVG</span>
                    </div>
                  </div>
                  <div className='text-[14px] text-[#4D4D4D] font-Meiryo font-bold justify-center my-2 text-center'>
                    アップロード - {selectedfile.length} ファイル
                  </div>
                  <div className="kb-attach-box mb-3 h-[150px] overflow-y-auto px-3">
                    {
                      selectedfile.map((data, index) => {
                        const { id, filename, filetype, fileimage, datetime, filesize } = data;
                        return (
                          <div className="file-atc-box" key={id}>
                            {
                              filename.match(/.(jpg|jpeg|png|gif|svg)$/i) ?
                                <div className="file-image"> <img src={fileimage} alt="" /></div> :
                                <div className="file-image"><i className="far fa-file-alt"></i></div>
                            }
                            <div className="flex file-detail justify-between">
                              <h5>{filename}</h5>
                              <img src="assets/icons/Close.svg" onClick={() => DeleteSelectFile(id)} />
                            </div>
                          </div>
                        )
                      })
                    }
                  </div>
                </form>

                {Files.length > 0 ?
                  <div className="kb-attach-box">
                    <hr />
                    {
                      Files.map((data, index) => {
                        const { id, filename, filetype, fileimage, datetime, filesize } = data;
                        return (
                          <div className="file-atc-box" key={index}>
                            {
                              filename.match(/.(jpg|jpeg|png|gif|svg)$/i) ?
                                <div className="file-image"> <img src={fileimage} alt="" /></div> :
                                <div className="file-image"><i className="far fa-file-alt"></i></div>
                            }
                            <div className="flex file-detail justify-between">
                              <h5>{filename}</h5>
                              <img src="assets/icons/Close.svg" onClick={() => DeleteSelectFile(id)} />
                            </div>
                          </div>
                        )
                      })
                    }
                  </div>
                  : ''}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  );
};

export default DragDropImage;

