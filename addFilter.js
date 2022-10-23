var Tool = class {
  cards = [];
  curCardIndex = 0;

  constructor() {
    const wrap = document.createElement('div');
    wrap.className = "bossFliterWrap";
    wrap.style = `
      position: fixed;
      right: 0;
      top: 0;
      z-index: 10000;
      display: flex;
    `;
    this.wrap = wrap

    const btnStyle = `
      margin-right: 20px;
      background-color: #5dd5c8;
      color: #fff;
      line-height: 30px;
      padding: 0 20px;
      border: 0 none;
    `;
    const listNumArea = document.createElement('div');
    listNumArea.style = btnStyle;
    this.listNumArea = listNumArea;
    wrap.appendChild(listNumArea);

    const nextBtn = document.createElement('button');
    nextBtn.innerText = 'next';
    nextBtn.style = btnStyle;
    nextBtn.addEventListener('click', this.next.bind(this));
    wrap.appendChild(nextBtn);

    const prevBtn = document.createElement('button');
    prevBtn.innerText = 'prev';
    prevBtn.style = btnStyle;
    prevBtn.addEventListener('click', this.prev.bind(this));
    wrap.appendChild(prevBtn);

    const refreshBtn = document.createElement('button');
    refreshBtn.innerText = 'refreshList';
    refreshBtn.style = btnStyle;
    refreshBtn.addEventListener('click', this.refresh.bind(this));
    wrap.appendChild(refreshBtn);

    const destroyBtn = document.createElement('button');
    destroyBtn.innerText = 'destroy';
    destroyBtn.style = btnStyle;
    destroyBtn.addEventListener('click', this.destroy);
    wrap.appendChild(destroyBtn);

    const sayHiBtn = document.createElement('button');
    sayHiBtn.innerText = 'sayHi';
    sayHiBtn.style = btnStyle;
    sayHiBtn.addEventListener('click', this.sayHiCur.bind(this));
    wrap.appendChild(sayHiBtn);

    /*
    const newRuleWrap = document.createElement('div');
    const addNewRule = document.createElement('input');
    const addNewRuleLabel = document.createElement('label');
    addNewRuleLabel.innerText = 'useNewRule'
    addNewRule.name = 'addNewRule'
    addNewRule.id = 'addNewRule'
    addNewRule.type = 'checkbox'
    addNewRule.addEventListener('change', this.useNewRuleHandler)
    addNewRuleLabel.setAttribute('for', 'addNewRule')
    addNewRuleLabel.style = 'margin-left: 5px;'
    newRuleWrap.appendChild(addNewRule)
    newRuleWrap.appendChild(addNewRuleLabel)
    newRuleWrap.style=`
      ${btnStyle}
      display: flex;
    `
    wrap.appendChild(newRuleWrap);
    */

    document.body.appendChild(wrap);

    const frameElm = Array.from(document.querySelectorAll('iframe')).find(n => n.name === 'recommendFrame');

    this.root = frameElm ? frameElm.contentDocument : document;
    try {
      this.autoScrollDown().then(() => {
        this.find();
        this.curCardIndex = 0;
        this.show();
      }, (e) => {
        throw e
      })
    } catch (e) {
      alert(e.message);
    }
  }

  get curCard() {
    return this.cards[this.curCardIndex];
  }

  find() {
    const getEduData = (card) => {
      return Array.from(card.querySelectorAll('.edu-exps .timeline-item')).map(n => {
        const text = Array.from(n.querySelector('.content').childNodes)
          .filter(n => n.nodeType === 3)
          .map(n => n.nodeValue)
        const school = text[0]
        const major = text[1]
        const degree = text[2]
        const times = Array.from(n.querySelector('.time').childNodes)
          .filter(n => n.nodeType === 3)
          .map(n => parseInt(n.nodeValue))
        return {
          degree,
          major,
          school,
          start: times[0],
          end: times[1]
        }
      }).reverse()
    }
    this.cancelHighlight();
    const cards = Array.from(this.root.querySelectorAll('.candidate-card-wrap'));
    if (!cards.length) {
      throw new Error('没找到推荐牛人列表，请选择正确的页面');
    }
    this.cards = cards.filter(card => {
      const eduData = getEduData(card)
      if (!eduData.length || eduData.some(({ degree }) => degree === '大专')) {
        return false
      }
      let schools = []
      for (let i = 0, l = eduData.length; i < l; i++) {
        schools.push(eduData[i].school)
        const nextIndex = i + 1
        if (eduData[nextIndex] && ((eduData[nextIndex].start - eduData[i].end) > 1)) {
          break
        }
      }
      return schools.some(s => Tool.s985211.includes(s))
    })
      .filter(card => {
        const o = parseInt(card.querySelector('.base-info').innerText, 10);
        return o < 35;
      }).filter((card) => {
        const eduData = getEduData(card)
        const age = ((txt) => {
          const m = txt.match(/(\d+)岁/)
          if (m) {
            return parseInt(m[1], 10)
          }
          return NaN
        })(card.querySelector('.base-info').innerText)
        const admissionTime = (() => {
          if (eduData[0].degree === '本科') {
            return eduData[0].start
          }
          return NaN
        })()

        if (isNaN(age) || isNaN(admissionTime)) {
          return true
        } else {
          const birthYear1 = (new Date()).getFullYear() - age
          const birthYear2 = admissionTime - 18
          return Math.abs(birthYear1 - birthYear2) < 3
        }
      })
    // if (this.useNewRule) {
    // }
  }
  refresh() {
    this.find();
    this.show();
  }
  refreshListNumArea() {
    this.listNumArea.innerHTML = `${this.curCardIndex + 1} / ${this.cards.length}`;
  }

  findByGid(gid) {
    const targetIndex = this.cards.findIndex(card => card.querySelector('[data-geek]').getAttribute('data-geek') === gid);
    if (~targetIndex) {
      this.cancelHighlight();
      this.curCardIndex = targetIndex;
      this.show();
    }
  }

  next() {
    this.cancelHighlight();
    this.curCardIndex += 1;
    if (this.curCardIndex > this.cards.length - 1) {
      this.curCardIndex = 0;
    }
    this.show();
  }

  prev() {
    this.cancelHighlight();
    this.curCardIndex -= 1;
    if (this.curCardIndex < 0) {
      this.curCardIndex = this.cards.length - 1;
    }
    this.show();
  }

  highlight() {
    this.curCard && (this.curCard.style = "box-shadow: 0 0 5px red inset");
  }

  cancelHighlight() {
    this.curCard && (this.curCard.style = "");
  }

  show() {
    const cur = this.curCard;
    if (cur) {
      console.log(cur.querySelector("[data-geek]").getAttribute('data-geek'));
      cur.scrollIntoViewIfNeeded();
      this.highlight();
      this.refreshListNumArea();
    }
  }

  autoScrollDown = () => {
    let success, failed
    const resultP = new Promise((resolve, reject) => {
      success = resolve
      failed = reject
    })
    let retryCount = 0
    const maxRetryCount = 5
    const loop = () => {
      try {
        const loadmore = this.root.querySelector('.loadmore');
        const txt = loadmore.innerText
        if (txt === '滚动加载更多') {
          loadmore.scrollIntoViewIfNeeded()
          retryCount = 0
          setTimeout(loop, 1000)
        } else if (txt.includes('正在加载数据')) {
          if (retryCount === maxRetryCount) {
            throw new Error('网络好像不太好?')
          } else {
            retryCount += 1
            setTimeout(loop, 1000)
          }
        } else {
          success()
        }
      } catch (e) {
        failed(e)
      }
    }
    loop()
    return resultP
  }

  sayHi = (card) => {
    const sayHiBtn = card.querySelector('.operate-side .button-list .btn-greet');
    if (sayHiBtn) {
      sayHiBtn.click();
    }
  }

  sayHiCur() {
    this.sayHi(this.curCard);
  }

  sayHiAll(cards) {
    cards.forEach(this.sayHi);
  }
  destroy = () => {
    this.cancelHighlight()
    this.curCardIndex = 0
    this.cards = []
    this.wrap.remove()
    this.wrap = null
    this.root = null
    bossFliter = null
    Tool = null
  }
  useNewRuleHandler = (e) => {
    this.useNewRule = e.target.checked
    this.refresh()
  }
}

Tool.s985211 = ["清华大学", "北京大学", "厦门大学", "南京大学", "复旦大学", "天津大学", "浙江大学", "南开大学", "西安交通大学", "东南大学", "武汉大学", "上海交通大学", "山东大学", "湖南大学", "中国人民大学", "吉林大学", "重庆大学", "电子科技大学", "四川大学", "中山大学", "华南理工大学", "兰州大学", "东北大学", "西北工业大学", "哈尔滨工业大学", "华中科技大学", "中国海洋大学", "北京理工大学", "大连理工大学", "北京航空航天大学", "北京师范大学", "同济大学", "中南大学", "中国科学技术大学", "中国农业大学", "国防科学技术大学", "中央民族大学", "华东师范大学", "西北农林科技大学", "清华大学", "北京大学", "中国人民大学", "北京工业大学", "北京理工大学", "北京航空航天大学", "北京化工大学", "北京邮电大学", "对外经济贸易大学", "中国传媒大学", "中央民族大学", "中国矿业大学", "中央财经大学", "中国政法大学", "中国石油大学", "中央音乐学院", "北京体育大学", "北京外国语大学", "北京交通大学", "北京科技大学", "北京林业大学", "中国农业大学", "北京中医药大学", "华北电力大学", "北京师范大学", "中国地质大学", "复旦大学", "华东师范大学", "上海外国语大学", "上海大学", "同济大学", "华东理工大学", "东华大学", "上海财经大学", "上海交通大学", "南开大学", "天津大学", "天津医科大学", "河北工业大学", "重庆大学", "西南大学", "华北电力大学", "太原理工大学", "内蒙古大学", "大连理工大学", "东北大学", "辽宁大学", "大连海事大学", "吉林大学", "东北师范大学", "延边大学", "东北农业大学", "东北林业大学", "哈尔滨工业大学", "哈尔滨工程大学", "南京大学", "东南大学", "苏州大学", "河海大学", "中国药科大学", "中国矿业大学", "南京师范大学", "南京理工大学", "南京航空航天大学", "江南大学", "南京农业大学", "浙江大学", "安徽大学", "合肥工业大学", "中国科学技术大学", "厦门大学", "福州大学", "南昌大学", "山东大学", "中国海洋大学", "中国石油大学", "郑州大学", "武汉大学", "华中科技大学", "中国地质大学", "华中师范大学", "华中农业大学", "中南财经政法大学", "武汉理工大学", "湖南大学", "中南大学", "湖南师范大学", "中山大学", "暨南大学", "华南理工大学", "华南师范大学", "广西大学", "四川大学", "西南交通大学", "电子科技大学", "西南财经大学", "四川农业大学", "云南大学", "贵州大学", "西北大学", "西安交通大学", "西北工业大学", "陕西师范大学", "西北农林科大", "西安电子科技大学", "长安大学", "兰州大学", "新疆大学", "石河子大学", "海南大学", "宁夏大学", "青海大学", "西藏大学", "第二军医大学", "第四军医大学", "国防科学技术大学"];
Tool.s985211 = Array.from(new Set(Tool.s985211));

var bossFliter = new Tool();
