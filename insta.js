const puppeteer = require("puppeteer");
const dotenv = require("dotenv");
dotenv.config();
const crawler = async () => {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      args: ["--window-size=1920,1080", "--disable-notifications"],
      userDataDir: "C:UsersdhsdbAppDataLocalGoogleChromeUser Data",
    });
    const page = await browser.newPage();
    page.setViewport({
      width: 1080,
      height: 1080,
    });
    await page.goto("https://instagram.com");

    // 로그인이 되었을때
    if (await page.$('a[href="/bot135791/"]')) {
      console.log("이미 로그인이 되어있습니다");
      // 로그인이 안됬을때
    } else {
      // 페이스북으로 로그인 버튼
    //   await page.waitForSelector(".KPnG0");
    //   await page.click(".KPnG0");
    //   await page.waitForNavigation(); //facebook 로그인으로 넘어가는것을 대기
    //   await page.waitForSelector("#email");
    //   await page.type("#email", process.env.EMAIL);
    //   await delay(1000)
    //   await page.type("#pass", process.env.PASSWORD);
    //   await delay(1000)
    //   await page.waitForSelector("#loginbutton");
    //   await page.click("#loginbutton");
    //   await page.waitForNavigation(); //instagram으로 넘어가는것을 대기
    //   console.log("로그인을 완료 하였습니다 ");
    }
    await page.waitForSelector("article:first-of-type");

    //스토리 부분, 전화번호 추가, 프로필 사진추가 삭제하기
    await page.evaluate(() => {
      const story = document.querySelector(".zGtbP");
      const start = document.querySelector("._2eEhX");
      //삭제
      if (story) {
        story.parentNode.removeChild(story);
      }
      if (start) {
        start.parentNode.removeChild(start);
      }
      const recommended = document.querySelector(".vboSt");
      if (recommended) {
        recommended.parentNode.removeChild(recommended);
      }
    });
    await delay(1000)
    let result = [];
    let prevPostId = "";
    while (result.length < 10) {
      console.log(result)
      // 회원님을 위한 추천 삭제해주기

      const newPost = await page.evaluate(() => {
        // 더보기를 눌러서 진행해준다
        if (document.querySelector("button.sXUSN")) {
          document.querySelector("button.sXUSN").click();
        }
        //게시글 가져오기
        const article = document.querySelector("article:first-of-type");
        console.log(article);
        const postId =
          document.querySelector(".c-Yi7") &&
          document.querySelector(".c-Yi7").href;
        console.log(postId);
        const name =
          article.querySelector("a.sqdOP") &&
          article.querySelector("a.sqdOP").textContent;
        const image =
          article.querySelector(".KL4Bh img") &&
          article.querySelector(".KL4Bh img").src;
        console.log(image);
        const content =
          article.querySelector(".QzzMF:first-of-type") &&
          article.querySelector(".QzzMF:first-of-type").textContent;

        return {
          postId,
          name,
          image,
          content,
        };
      });

      // await page.evaluate(() => {
      //   // 좋아요 눌러주기
      //   const fill = document.querySelector(".fr66n button svg");
      //   if(fill.getAttribute("fill") === "#262626"){
      //     document.querySelector(".fr66n button").click();
      //   }
      // });
      await delay(1000)
      // 새 게시글의 postId가 이전 postId와 같지 않으면
      // 배열에 넣고 해당 포스트 아이디를 검증한다
      // 중복으로 데이터가 들어가는것을 방지
      if (newPost.postId !== prevPostId) {
        if (!(result.find((v) => v.postId === newPost.postId))) {
          result.push(newPost);
        }
      }
      prevPostId = newPost.postId;
      await page.evaluate(() => {
        window.scrollBy(0, 900);
      });
    }
    console.log(result);
  } catch (err) {
    console.log(err);
  }
};

crawler();

function delay( timeout ) {
	return new Promise(( resolve ) => {
		setTimeout( resolve, timeout );
	});
}