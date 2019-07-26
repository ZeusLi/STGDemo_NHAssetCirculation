
var bcx=null;
//使用vuejs排版业务逻辑
var main = new Vue({
    //绑定业务根元素
    el:'#main',
    //元素中需要使用到的数据
    data:{
        //状态控制显示
        //是否开始游戏
        isgame:false,
        /* 
        login代表登陆页面
        menu菜单
        trade交易所
        usercenter用户中心
        */
        now:'index',

        account_name:"",
        pwd:"",
        //公钥
        publickey:'',
        //控制遮罩层
        isshow:false,
        isinfo:false,
        //账户私钥
        //私钥
        accountprivatekey:'',
        //已拥有的飞机列表
        nowlists:['1'],
        //当前进行游戏的飞机
        nowplant:1,
        //当前已经拥有的飞机名称
        nowlistname:['维拉托尔级'],
        //当前已经拥有的飞机价格
        nowlistprice:[0],
        //存入账户信息
        //账户id
        accountinfo:{
            account_name:""
        },
        //判断是不是存储过一次信息
        islogin:false,
        NHAssets:[],
        orders:[],
        buyIndex:-1,
        loading:false,
        loadingText:"Loading..."
    },
    computed:{
        NHOrders(){
            let list=[];
            this.orders.forEach(item=>{
                 if(typeof item.base_describe=="string"){
                     try{
                       item.base_describe=JSON.parse(item.base_describe);
                       list.push(item);
                     }catch(e){}
                 }
               return item
            });
            return list;
       }
    },
    watch:{
        now(nv){
            if(nv=="buy"){//当前所在位置是购买位置则查询非同质资产交易订单
                this.queryNHAssetOrders(true);
            }
        }
    },
    created(){
        this.init();
    },
    //元素方法
    methods:{
        //查询非同质资产交易订单
        queryNHAssetOrders(loading=false){
            if(loading)
            this.loading=true;
            bcx.queryNHAssetOrders({
                assetIds:"",
                worldViews:"fly",
                page:1,
                pageSize:30
            }).then(res=>{
                this.loading=false;
                if(res.code==1){
                    this.orders=res.data;
                }else{
                   alert(res.message);
                }
            })
        },
        init(){
           bcx=new BCX({
                ws_node_list:[	
                    {url:"ws://47.93.62.96:8049",name:"Cocos - China - Xiamen"} ,
                ],
                networks:[
                    {
                        core_asset:"COCOS",
                        chain_id:"7d89b84f22af0b150780a2b121aa6c715b19261c8b7fe0fda3a564574ed7d3e9" 
                    }
                ], 
                faucet_url:"http://47.93.62.96:8041",
                auto_reconnect:true
           });
        
        },

        //login
        login(){
            this.loading=true;
            //登录
             bcx.passwordLogin({
                account:this.account_name,
                password:this.pwd
            }).then(res=>{
                this.loading=false;
                if(res.code==1){
                    this.now = 'menu';
                    this.accountinfo=res.data;
                    sessionStorage.accountinfo=res.data;
                    this.getData(false);
                    this.subscribeToAccountOperations();
                    this.subscribeToChainTranscation();
                }else{
                    alert(res.message)
                }
            })
        },
        subscribeToAccountOperations(){
            //订阅当前登录账户区块链交易
            bcx.subscribeToAccountOperations({
                account:this.accountinfo.account_name,
                callback:res=>{
                    if(res.code==1){
                        if(this.now=="choiseplant"){
                            this.getData(true); 
                        }
                    }
                }
            })
        },  
        subscribeToChainTranscation(){
            //订阅链上所有区块链交易
            bcx.subscribeToChainTranscation({
                callback:res=>{
                    if(res.code==1){
                        if(this.now=="buy"){
                            this.queryNHAssetOrders();
                        }
                    }
                }
            })
        },
        //获取飞机fly非同质资产
        getData(play = false){
            bcx.queryAccountNHAssets({
                account:this.accountinfo.account_name,
                worldViews:['fly'],
                page:1,
                pageSize:10
            }).then(res=>{
                this.nowlists=['1'];
                // //当前进行游戏的飞机
                // this.nowplant=1;
                //当前已经拥有的飞机名称
                this.nowlistname=['维拉托尔级'];

                if(res.code==1){
                     let flys={};
                     this.NHAssets=res.data.map(item=>{
                        let base_describe=item.base_describe;
                        try{
                            base_describe=JSON.parse(base_describe);
                            item.base_describe=base_describe;
                            if(!flys[base_describe.type]){
                                this.nowlists.push(base_describe.type);
                                this.nowlistname.push(base_describe.name);
                                flys[base_describe.type]=base_describe;
                            }  
                        }catch(e){ }
                        return item;
                     });
                    // this.total=res.total
                    if(play){
                        this.now = 'choiseplant';
                    }
                }
            })
      
        },
        //返回按钮
        back(){
            this.now == "login" || this.now == "logup"?
                this.now = 'index' : this.now = 'menu';                
        },
        //跳到选择飞机
        choiseplant(){
            this.getData(true);
        },
        //进行飞机选择
        change(v){
            console.log(v);
            if (this.nowlists.join(',').indexOf(v)==-1){
                alert('您暂未拥有该飞机!请返回购买飞机');
            }else{
                this.nowplant=v;
            }
        },
        changeBuy(index){
            this.buyIndex=index;
        },
        buyFly(){
            var isBuy=confirm("确认购买");
            if(isBuy){
                this.loading=true;
                //非同质资产交易订单撮合
                bcx.fillNHAssetOrder({
                    orderId:this.orders[this.buyIndex].id
                }).then(res=>{
                    this.loading=false;
                    alert(res.code==1?"购买成功":res.message)
                })
            }
        },
        //开始游戏
        playgame(){
            if(this.nowplant==2){
                heros[0] = new Image();
                heros[0].src = "images/hero_1.png";
                heros[1] = new Image();
                heros[1].src = "images/hero_2.png";
                heros[2] = new Image();
                heros[2].src = "images/hero_1_blowup_n1.png";
                heros[3] = new Image();
                heros[3].src = "images/hero_1_blowup_n2.png";
                heros[4] = new Image();
                heros[4].src = "images/hero_1_blowup_n3.png";
                heros[5] = new Image();
                heros[5].src = "images/hero_1_blowup_n4.png";
                // var bullet = new Image();
                bullet.src = "images/bullet.png";
            } else if (this.nowplant == 1){
                heros[0] = new Image();
                heros[0].src = "images/hero1.png";
                heros[1] = new Image();
                heros[1].src = "images/hero2.png";
                heros[2] = new Image();
                heros[2].src = "images/hero_blowup_n1.png";
                heros[3] = new Image();
                heros[3].src = "images/hero_blowup_n2.png";
                heros[4] = new Image();
                heros[4].src = "images/hero_blowup_n3.png";
                heros[5] = new Image();
                heros[5].src = "images/hero_blowup_n4.png";
                // var bullet = new Image();
                bullet.src = "images/bullet.png";
            }else{
                heros[0] = new Image();
                heros[0].src = "images/hero_3.png";
                heros[1] = new Image();
                heros[1].src = "images/hero_4.png";
                heros[2] = new Image();
                heros[2].src = "images/hero_2_blowup_n1.png";
                heros[3] = new Image();
                heros[3].src = "images/hero_2_blowup_n2.png";
                heros[4] = new Image();
                heros[4].src = "images/hero_2_blowup_n3.png";
                heros[5] = new Image();
                heros[5].src = "images/hero_2_blowup_n4.png";
                // var bullet = new Image();
                bullet.src = "images/bullet-.png";
            }
            this.isgame = true;
            document.getElementById('hidepanel').style.display = 'none';
            document.getElementById('main').style.display = 'none';
        }
    }
})