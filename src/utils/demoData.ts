import { db } from './database'
import { PlaceholderImages } from './imageGenerator'
import { Logger } from './logger'

// 生成演示数据
export function generateDemoData() {
  // 检查是否已有足够数据
  const existingUsers = db.getUsers()
  const existingPosts = db.getPosts()
  
  if (existingUsers.length > 10 && existingPosts.length > 20) {
    Logger.info('演示数据检查', { message: '已有足够的演示数据' })
    return
  }

  Logger.info('演示数据生成', { message: '正在生成演示数据...' })

  // 生成用户
  const userNames = [
    { username: 'alice_wang', nickname: '爱丽丝', bio: '热爱摄影的文艺青年' },
    { username: 'bob_li', nickname: '小李同学', bio: '计算机系大三学生' },
    { username: 'carol_zhang', nickname: '张小美', bio: '美食博主，探店达人' },
    { username: 'david_chen', nickname: '陈大卫', bio: '篮球队队长' },
    { username: 'emma_liu', nickname: '刘艾玛', bio: '学霸一枚，乐于分享学习经验' },
    { username: 'frank_wu', nickname: '吴小凡', bio: '游戏爱好者' },
    { username: 'grace_zhou', nickname: '周格蕾丝', bio: '音乐社社长' },
    { username: 'henry_xu', nickname: '徐亨利', bio: '健身达人' },
    { username: 'iris_yang', nickname: '杨艾瑞斯', bio: '动漫爱好者' },
    { username: 'jack_ma', nickname: '马小杰', bio: '创业者' }
  ]

  const createdUsers: number[] = []
  userNames.forEach((userData, index) => {
    const existingUser = db.getUserByUsername(userData.username)
    if (!existingUser) {
      // ⚠️ 安全警告：演示数据使用弱密码 '123456'，仅用于开发测试
      // 生产环境必须使用强密码或让用户自行设置
      const user = db.createUser({
        username: userData.username,
        nickname: userData.nickname,
        email: `${userData.username}@campus.edu`,
        password: '123456', // ⚠️ 演示数据默认密码，生产环境必须修改！
        avatar: PlaceholderImages.avatar(userData.nickname[0], 80),
        bio: userData.bio
      })
      createdUsers.push(user.id)
      
      // 更新用户状态
      db.updateUser(user.id, {
        role: 'user',
        status: 'active',
        lastLoginAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      })
    }
  })

  // 生成帖子
  const topics = ['校园生活', '学习交流', '美食分享', '运动健身', '游戏娱乐']
  const postTemplates = [
    {
      title: '图书馆自习攻略分享',
      content: '作为一个经常泡图书馆的学生，我来分享一下图书馆自习的小技巧。首先要选择合适的位置，靠窗的位置光线好但可能会热，角落的位置安静但可能会闷。其次要准备好必要的物品，比如水杯、笔记本、充电器等。最后要注意休息，每学习一小时就起来活动一下。',
      topic: '学习交流',
      tags: ['学习', '图书馆', '攻略']
    },
    {
      title: '校园美食探店 - 食堂新开的川菜窗口',
      content: '今天去尝试了食堂新开的川菜窗口，味道真的很不错！推荐麻婆豆腐和回锅肉，价格也很实惠。老板是四川人，做的菜很正宗。营业时间是11:00-13:30和17:00-19:30，大家可以去试试！',
      topic: '美食分享',
      tags: ['美食', '食堂', '川菜']
    },
    {
      title: '期末复习经验分享',
      content: '马上就要期末考试了，分享一下我的复习方法。第一步是整理笔记，把重点内容标记出来。第二步是做历年真题，了解考试题型。第三步是组队复习，互相讨论问题。最后一步是保持良好的作息，不要熬夜。祝大家都能取得好成绩！',
      topic: '学习交流',
      tags: ['期末', '复习', '考试']
    },
    {
      title: '篮球场约球啦！',
      content: '周末下午3点在东区篮球场打球，现在还差2个人，有兴趣的同学可以来！我们水平一般，主要是娱乐为主，欢迎新手加入。记得带好水和毛巾哦！',
      topic: '运动健身',
      tags: ['篮球', '约球', '运动']
    },
    {
      title: '推荐一款好玩的游戏',
      content: '最近在玩一款叫《星露谷物语》的游戏，真的太治愈了！游戏画风很可爱，玩法也很丰富，可以种田、钓鱼、挖矿、社交等等。强烈推荐给喜欢休闲游戏的朋友们！',
      topic: '游戏娱乐',
      tags: ['游戏', '推荐', '休闲']
    },
    {
      title: '校园秋景真美',
      content: '今天在校园里散步，发现秋天的校园真的太美了！银杏叶黄了，枫叶红了，阳光洒在地上，美得像一幅画。推荐大家去图书馆后面的小路走走，那里的景色最美！',
      topic: '校园生活',
      tags: ['校园', '秋天', '风景']
    },
    {
      title: '健身房新手指南',
      content: '作为一个健身两年的老手，给新手们一些建议。首先要制定合理的训练计划，不要一开始就练太猛。其次要注意动作规范，可以请教教练或者看视频学习。最后要坚持，健身是一个长期的过程。加油！',
      topic: '运动健身',
      tags: ['健身', '新手', '指南']
    },
    {
      title: '推荐几个学习网站',
      content: '分享几个我常用的学习网站：1. Coursera - 有很多优质的在线课程；2. GitHub - 程序员必备；3. Stack Overflow - 编程问题解答；4. 知乎 - 各种知识分享。希望对大家有帮助！',
      topic: '学习交流',
      tags: ['学习', '网站', '推荐']
    },
    {
      title: '校园周边美食推荐',
      content: '给大家推荐几家校园周边的美食店：1. 北门的烤肉店，味道很好价格实惠；2. 东门的奶茶店，推荐芝士奶盖；3. 南门的火锅店，适合聚餐。周末可以约上朋友一起去！',
      topic: '美食分享',
      tags: ['美食', '周边', '推荐']
    },
    {
      title: '社团招新啦！',
      content: '我们摄影社正在招新！如果你对摄影感兴趣，欢迎加入我们。我们会定期组织外拍活动，还会邀请专业摄影师来讲座。不需要有摄影基础，只要有热情就可以！报名请联系我。',
      topic: '校园生活',
      tags: ['社团', '招新', '摄影']
    }
  ]

  const allUsers = db.getUsers()
  postTemplates.forEach((template, index) => {
    const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)]
    const hasImages = Math.random() > 0.5

    const post = db.createPost({
      title: template.title,
      content: template.content,
      authorId: randomUser.id,
      topic: template.topic,
      tags: template.tags,
      images: hasImages ? [
        {
          id: 1,
          url: PlaceholderImages.postCover(index + 1, template.topic, 600, 400),
          width: 600,
          height: 400
        }
      ] : undefined
    })

    // 随机设置一些帖子为热门或置顶
    if (Math.random() > 0.8) {
      db.updatePost(post.id, { isHot: true })
    }
    if (index < 2) {
      db.updatePost(post.id, { isTop: true })
    }

    // 随机添加一些点赞和浏览
    const likes = Math.floor(Math.random() * 50)
    const views = Math.floor(Math.random() * 200) + 50
    db.updatePost(post.id, { 
      likes, 
      views,
      status: 'approved' // 设置为已审核
    })
  })

  // 生成一些评论
  const posts = db.getPosts()
  const commentTemplates = [
    '说得太对了！',
    '感谢分享！',
    '学到了，收藏了！',
    '我也有同感',
    '很有帮助，谢谢！',
    '赞同！',
    '写得很好',
    '有道理',
    '支持一下',
    '不错不错'
  ]

  posts.forEach(post => {
    const commentCount = Math.floor(Math.random() * 5)
    for (let i = 0; i < commentCount; i++) {
      const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)]
      const randomComment = commentTemplates[Math.floor(Math.random() * commentTemplates.length)]
      
      db.createComment({
        postId: post.id,
        authorId: randomUser.id,
        content: randomComment
      })
    }
  })

  console.log('演示数据生成完成！')
  console.log(`创建了 ${createdUsers.length} 个用户`)
  console.log(`创建了 ${postTemplates.length} 个帖子`)
}

// 清除所有数据
export function clearAllData() {
  const keys = [
    'campus_forum_users',
    'campus_forum_posts',
    'campus_forum_comments',
    'campus_forum_notifications',
    'campus_forum_messages',
    'campus_forum_conversations',
    'campus_forum_current_user',
    'campus_forum_post_counter',
    'campus_forum_user_counter',
    'campus_forum_message_counter',
    'campus_forum_conversation_counter'
  ]
  
  keys.forEach(key => localStorage.removeItem(key))
  Logger.info('数据清理', { message: '所有数据已清除' })
  
  // 重新初始化默认数据
  db.initializeDefaultData()
  Logger.info('数据初始化', { message: '默认数据已重新初始化' })
}

