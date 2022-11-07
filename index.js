const axios = require("axios");
const puppeteer = require("puppeteer");
const download = require('image-downloader');
const { id, pw, acckey, delayms, title, comment } = require("./setting.json");

(async () => {
    const browser = await puppeteer.launch({
        headless: false
    });
    
    const page = await browser.newPage();
    
    await page.setViewport({
        width : 1280,
        height : 860,
        deviceScaleFactor : 1,
        isMobile : false,
    });

    const acceptBeforeUnload = dialog => dialog.type() === "beforeunload" && dialog.accept();
    page.on("dialog", acceptBeforeUnload);

    await page.goto('https://nid.naver.com/nidlogin.login');
    
    await page.evaluate((id, pw) => {
        document.querySelector('#id').value = id;
        document.querySelector('#pw').value = pw;
    }, id, pw);

    await page.click('#frmNIDLogin > ul > li > div > div.btn_login_wrap');
    await page.waitForNavigation();

    console.log("로그인 완료\n")

    // await page.goto(`https://blog.naver.com/${id}`);
    
    // await write(page, '하츠네 미쿠', "미쿠는 현역이야!!", 'C:/Users/bylee/OneDrive/사진/프로필/100363262_p0_master1200.jpg');

    const posts = await getInstaPost();

    let sf = true; // 처음부터 시작

    let i = 1;
    let sp = "17858626370816129"; // 네이버 블로그에 발행을 시작할 인스타 포스트의 아이디
    let start = false;
    for(let post of posts) {
        // 시작 포스트
        if(post.id == sp) {
            start = true
            console.log("시작할 포스트를 찾았습니다")
        }
        // 시작 포스트

        if(start || sf) {
            let media;
    
            switch(post.media_type) {
                case "CAROUSEL_ALBUM":
                case "IMAGE":
                    media = post.media_url;
                    break;
                case "VIDEO":
                    media = post.thumbnail_url;
                    break;
                default:
                    break;
            }
            console.log(`[${new Date(post.timestamp).toString()}] ${i}번째 게시글(${post.id})`)
    
            await write(page, title, post.caption ?? "", await getFile(media));
    
            await delay(delayms)
            
            i++
        }
    }

    console.log("모든 인스타그램의 포스트를 발행했습니다")
    browser.close();
    console.log("프로그램 종료합니다")
})();

const write = async (page, title, content, imagePath) => {
    try {
        await page.goto(`https://blog.naver.com/${id}?Redirect=Write`);
        console.log("글 작성을 시작합니다")

        const frame = page.frames().find(frame => frame.name() === 'mainFrame')

        const titleSelect = "#root > div > div > div > div > div.se-wrap.se-dnd-wrap > div > div.se-container > div.se-content.__se-scroll-target > section > article > div.se-component.se-documentTitle.se-l-default > div.se-component-content > div > div > p > span";

        await frame.waitForSelector(titleSelect);
        console.log("에디터의 로딩이 완료되었습니다");

        try {
            await frame.click("#root > div > div > div > div > div.se-wrap.se-dnd-wrap > div > div.se-popup.se-popup-alert.se-popup-alert-confirm > div.se-popup-container.__se-pop-layer > div.se-popup-button-container > button.se-popup-button.se-popup-button-cancel");
            console.log("감지된 모달을 취소 하였습니다")
        } catch {}
        try {
            await frame.evaluate(() => document.querySelector("#root > div > div > div > div > div.se-wrap.se-dnd-wrap > div > div.se-container > article > div > header > button").click());
            console.log("도움말 창을 종료 하였습니다")
        } catch {}

        // 사진 불러오기 방식
        // await frame.click("#root > div > div.container__hIWa0 > div > div > div.se-wrap.se-dnd-wrap > div > div.se-container > div.se-content.__se-scroll-target > section > article > div.se-component.se-documentTitle.se-l-default > div.se-cover-button-wrap > div.se-cover-attach-button-container > span.se-cover-button.se-cover-button-sns-image-upload")
        // await frame.waitForSelector("#root > div > div.container__hIWa0 > div > div > div.se-wrap.se-dnd-wrap > div > div.se-popup.se-popup-cloud-sns > div.se-popup-container.__se-pop-layer > button")
        // await frame.click("#root > div > div.container__hIWa0 > div > div > div.se-wrap.se-dnd-wrap > div > div.se-popup.se-popup-cloud-sns > div.se-popup-container.__se-pop-layer > button")

        
        // 템플릿 방식
        // await frame.click("#root > div > div > div > div > div.se-wrap.se-dnd-wrap > div > header > div.se-header-inbox.se-l-document-toolbar > ul > li.se-toolbar-item.se-toolbar-item-template > button")
        // console.log("템플릿 창을 열었습니다")
        // await frame.waitForSelector("#root > div > div > div > div > div.se-wrap.se-dnd-wrap > div > div.se-container > aside > div > div.se-panel-tab.se-panel-tab-library.se-sidebar-panel-tab-library > ul > li:nth-child(3) > button")
        // await frame.click("#root > div > div > div > div > div.se-wrap.se-dnd-wrap > div > div.se-container > aside > div > div.se-panel-tab.se-panel-tab-library.se-sidebar-panel-tab-library > ul > li:nth-child(3) > button")
        // console.log("내 템플릿 선택")
        
        // 포커스 대기
        // await frame.waitForSelector("#root > div > div.container__hIWa0 > div > div > div.se-wrap.se-dnd-wrap > div > div.se-container > div.se-content.__se-scroll-target > section > article > div.se-component.se-documentTitle.se-l-default.se-is-selected > div.se-component-content > div > div > p > span.se-placeholder.__se_placeholder.se-ff-nanumgothic.se-fs32.se-placeholder-focused")
        // await delay(1000)
        // await page.keyboard.type('TEST 제목')
        
        // 선 발행 방식
        await frame.click("#root > div > div > div > div > div:nth-child(3) > button");
        await delay(100);
        await frame.click("#root > div > div > div > div > div:nth-child(3) > div > div > div > div.layer_btn_area__UshuU > div > button");
        await page.keyboard.type(title);
        console.log("제목을 작성하였습니다")

        // 본문 포커스
        // await frame.click("#root > div > div.container__hIWa0 > div > div > div.se-wrap.se-dnd-wrap > div > div.se-container > div.se-content.__se-scroll-target > section > article > div.se-component.se-text.se-l-default > div > div > div > div > p > span.se-placeholder.__se_placeholder.se-ff-nanumgothic.se-fs15")

        // 사진 업로드
        const [fileChooser] = await Promise.all([
            page.waitForFileChooser(), // 로컬 파일 선택하는 창 기다리기, ┎━파일 선택 창을 여는 버튼 클릭
            frame.click("#root > div > div.container__hIWa0 > div > div > div.se-wrap.se-dnd-wrap > div > header > div.se-header-inbox.se-l-document-toolbar > ul > li.se-toolbar-item.se-toolbar-item-image > button"),
        ]);
        // 파일선택 창이 열리면 imagePath이미지를 선택
        await fileChooser.accept([imagePath]);
        console.log("사진 업로드중")
        try {
            await frame.waitForSelector("#root > div > div.container__hIWa0 > div > div > div.se-wrap.se-dnd-wrap > div > div.se-container > div.se-content.__se-scroll-target > section > article > div.se-component.se-image.se-l-default > div > div > div > div.se-module.se-module-image.__se-unit > div.se-drop-indicator > img");
        } catch {
            return console.log("업로드 실패")
        }
        console.log("사진 업로드 완료")

        // 본문 내용
        await page.keyboard.type(`${content}\n${comment}`);

        // 발행
        await frame.click("#root > div > div > div > div > div:nth-child(3) > button");
        await delay(100);
        await frame.click("#root > div > div > div > div > div:nth-child(3) > div > div > div > div.layer_btn_area__UshuU > div > button");
        try {
            await page.frames().find(frame => frame.name() === 'mainFrame').waitForSelector("#blogTitleText");
        } catch {
            try {
                await frame.waitForSelector("#root > div > div.container__hIWa0 > div > div > div.se-wrap.se-dnd-wrap > div > div.se-popup.se-popup-alert > div.se-popup-container.__se-pop-layer");
                console.log("ID당 글 발행 기준을 초과하여 글 발행이 잠시 제한 되었습니다")
                await page.goto(`https://blog.naver.com/${id}`);
                return
            } catch {}
            console.log("글 발행을 실패했습니다")
            await page.goto(`https://blog.naver.com/${id}`);
            delay(10000)
            return
        }
        console.log("글 발행 완료\n")

        // 제목 수정
        // await frame.evaluate((titleSelect) => document.querySelector(titleSelect).textContent = "안녕", titleSelect)
    } catch(e) {
        console.log("글 발행을 실패했습니다")
        console.log(e)
        await page.goto(`https://blog.naver.com/${id}`);
        return
    }  
}

const getInstaPost = async () => {
    console.log("인스타 게시글을 불러옵니다")

    let res = await axios.get(`https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,username,timestamp&limit=100&access_token=${acckey}`);
    let data = res["data"];
    let result = data["data"];

    let i = 1
    while(true) {
        try {
            if(data["paging"].hasOwnProperty("next")) {
                // console.log(data["paging"]["next"])
                res = await axios.get(data["paging"]["next"]);
                data = res["data"];
                
                result.push(...data["data"])
    
                console.log(`${i}번째 페이지 불러옴`)

                delay(500)
    
                i++

                continue;
            } else {
                break;
            }
        } catch(e) {
            console.log("인스타 게시글을 불러오던중 오류가 발생했습니다")
            console.log(e)
        }
    }
    result.reverse()
    
    // console.log(result)
    require("fs").writeFileSync('post.json', JSON.stringify(result))

    console.log("========================================")
    console.log("인스타그램 게시글을 불러왔습니다")
    console.log(`총 ${result.length}개의 게시글을 찾았습니다`)
    console.log("========================================")

    return result;
}

const getFile = async (url) => {
    const path = `${__dirname}\\image\\image.jpg`;

    download.image({
        url,
        dest: path 
    }); // image-downloader모듈로 사진 다운로드

    return path;
}

const delay = (timeout) => {
	return new Promise(( resolve ) => {
		setTimeout( resolve, timeout );
	});
}