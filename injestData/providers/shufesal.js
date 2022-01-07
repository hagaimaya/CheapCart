
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const axios = require('axios');
const fs = require('fs');
const Path = require('path');
const zlib = require("zlib");

const getFileDownloadLinksFromPage = async (pagenumber) => {
    let data = await JSDOM.fromURL("http://prices.shufersal.co.il/FileObject/UpdateCategory?catID=2&storeId=0&page=" + pagenumber);
    let links = [...data.window.document.querySelectorAll(".webgrid-row-style")]
        .map((item) => {
            return item.querySelector("a").href
        });


    return links;
}
const getNumberOfPages = async () => {
    let data = await JSDOM.fromURL("http://prices.shufersal.co.il/");
    let numberOfPages = 0;
    [...data.window.document.querySelector(".webgrid-footer").querySelectorAll("a")].map(
        (item) => {
            return item.href.toString().replace("http://prices.shufersal.co.il/?page=", "");
        }).forEach((pageNumber) => {
            if (pageNumber > numberOfPages) {
                numberOfPages = pageNumber;
            }
        })

    return numberOfPages;

}

const downloadGzFile = async (gzFile) => {
    const dirPath = Path.resolve(__dirname + "../../../data/shufersal/gz/", gzFile.branchId);

    const path = Path.resolve(dirPath, gzFile.name);
    //const writer = fs.createWriteStream(path);
    const response = await axios({
        url: gzFile.url,
        method: 'GET',
        responseType: 'stream'
    });

    await fs.promises.mkdir(dirPath, { recursive: true })
        .catch((error) => { console.log("mkdirerror", "error") })

    const file = fs.createWriteStream(path);

    //await response.data.pipe(file);

    gzFile.path = path;
    gzFile.XMLpath = Path.resolve(dirPath, gzFile.name.replace("gz","xml"));
    const writeStream = fs.createWriteStream(gzFile.XMLpath);
    const unzip = zlib.createGunzip();

    await response.data.pipe(unzip).pipe(writeStream);
    return gzFile;
}

const unZipGzFile = async (gzFile) => {
    const fileContents = fs.createReadStream(gzFile.path);
    const writeStream = fs.createWriteStream(gzFile.path.replace("gz","xml"));
    const unzip = zlib.createGunzip();

    fileContents.pipe(unzip).pipe(writeStream);
        
}
const main = async () => {
    let numberOfPages = await getNumberOfPages();
    for (let pageNumber = 1; pageNumber <= numberOfPages; pageNumber++) {
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
                    downloadGzFile(gzFile)
                        .then((gzFile) => {
                            console.log(gzFile);
                         //  unZipGzFile(gzFile).catch((err)=> {console.log("ERR: ", err)});
                        });
                });


            });

    }
}

main();