
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const axios = require('axios');
const fs = require('fs');
const Path = require('path'); 

const getFileDownloadLinksFromPage = async (pagenumber)=> {
    let data = await JSDOM.fromURL("http://prices.shufersal.co.il/FileObject/UpdateCategory?catID=2&storeId=0&page=" + pagenumber);
    let links = [...data.window.document.querySelectorAll(".webgrid-row-style")]
                    .map((item) => 
                        {
                                return item.querySelector("a").href
                        });

   
    return links;
}
const getNumberOfPages = async ()  => {
    let data = await JSDOM.fromURL("http://prices.shufersal.co.il/");
    let numberOfPages =0;
    [...data.window.document.querySelector(".webgrid-footer").querySelectorAll("a")].map(
        (item) => { 
           return item.href.toString().replace("http://prices.shufersal.co.il/?page=", "");
        }).forEach((pageNumber) => {
            if(pageNumber > numberOfPages){
                numberOfPages = pageNumber;
            }
        })
    
    return numberOfPages;
    
}

const downloadGzFile = async (gzFile)=> {
    const dirPath = Path.resolve(__dirname + "../../../data/shufersal/gz/", gzFile.branchId); 
    
    const path = Path.resolve(dirPath, gzFile.name);
    console.log(path);
    //const writer = fs.createWriteStream(path);
    const response = await axios({
        url: gzFile.url,
        method: 'GET',
        responseType: 'gzip'
      });

    fs.promises.mkdir(dirPath, { recursive: true })
        .then(() => { return fs.promises.writeFile(path, response.data);})
        .catch((error) => {console.log("mkdirerror", "error")})
}
const main = async () => {
    let numberOfPages = await getNumberOfPages();
    for (let pageNumber =1; pageNumber <= numberOfPages; pageNumber++ ){
        getFileDownloadLinksFromPage(pageNumber).then(
            async (urls) => {
                    urls.forEach((gzLink) => {
                        const url = new URL(gzLink);
                        const remotefileName = url.pathname.replace("/pricefull/", "");
                        const branchId = url.pathname.split("-")[1];
                        let gzFile = {
                            name: remotefileName,
                            branchId: branchId,
                            url: url.href
                        };
                        downloadGzFile(gzFile).catch((err)=> console.log(err));
                    });
                    
                
        });
                          
    }  
}

main();