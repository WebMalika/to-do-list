if(!localStorage.getItem('hellion')) hellionUpdate(1)
if(!localStorage.getItem('list-data')) listUpdate([])

function listUpdate(list){
    localStorage.setItem('list-data', JSON.stringify(list))
}
function hellionUpdate(val){
    localStorage.setItem('hellion', Number(val))
}
const app = Vue.createApp({
    data(){
        return {
            list: JSON.parse(localStorage.getItem('list-data')),
            global: JSON.parse(localStorage.getItem('list-data')).length,
            header: 'todolist',
            newName: '',
            hellion: Number(localStorage.getItem('hellion'))
        }
    },
    template: `<div class="app-container">
        <p class="header"> {{ header }} </p>
        <add-todo-item @add-task="addTask" v-model="newName"></add-todo-item>
        <div class="list-block">
            <todo-item 
                v-for="(item, index) in list" 
                :item="item" 
                :index="index"
                :hellion="hellion"
                @delete-item="deleteItem" 
                @checked-task="checkedTask" 
                @make-important="makeImportant"
            >
            </todo-item>
        </div> 
        <p v-show="list == []" class="notData">Данных нет. Создайте задачи!</p>
        <btn-hellion :list="list" @returnHellion="hellion = $event"></btn-hellion>
   </div>
    `,
    methods: {
        addTask: function(){
            this.list.push({});

            if(this.hellion)
                this.list[this.global].name = this.newName;
            else 
                this.list[this.global].name = this.newName.split('').reverse().join('');

            this.global++;
            this.newName = '';
            listUpdate(this.list)
        },
        deleteItem: function(index){
            this.list.splice(index, 1);
            listUpdate(this.list)
            this.global--
        },
        checkedTask: function(index){
            this.list[index].status = 'finished';
            listUpdate(this.list)
        },
        makeImportant:function(index){
            let tmp = this.list[index];
            this.list.splice(index, 1);

            if(!tmp.status || tmp.status == "unimportant"){    
                tmp.status = 'important';    
                this.list.unshift(tmp);
            } else {
                tmp.status = 'unimportant';
                this.list.push(tmp);
            }
            
            listUpdate(this.list)
        }
    }
});
app.component('add-todo-item', {
    props: ['modelValue'],
    emits: ['update:modelValue', 'addTask'],
    template: `
    <div class="additional-block">
        <input @keyup.enter="$emit('addTask')" type="text" :value="modelValue" @input="$emit('update:modelValue', $event.target.value)"/>
        <button @click="$emit('addTask')" class="saveBtn">Сохранить</button>
    </div>    
    `
});

app.component('todo-item', {
    props: {
        index: String,
        item: Object,
        hellion: Boolean // прослушивает пасхалку
    },
    emits: ['deleteItem', 'checkedTask', 'makeImportant'],
    template: `
    <div class="item" :class="additionalClasses">
        <div class="number"> {{ index + 1 }} </div>
        <div class="name"> {{ item.name }} </div>

        <div class="buttons-group">
            <button v-show="!additionalClasses" class="makeImportant btn" :class="importantClasses" @click="$emit('makeImportant', index)">
                <span class="icon-flag"></span>
            </button>

            <button v-show="!additionalClasses && hellion" class="checkedTask btn" @click="$emit('checkedTask', index)">
                <span class="icon-check"></span>
            </button>

            <button v-show="hellion" class="deleteItem btn" @click="$emit('deleteItem', index)">
                <span class="icon-x"></span>
            </button>
        </div> 
    </div> 
    `,
    computed: {
        additionalClasses: function(){
            return this.item.status == 'finished' ? 'item_finish' : false;
        },
        importantClasses: function(){
            return this.item.status == 'important' ? 'icon_important' : 'icon_unimportant';
        }
    }
})
// кнопка-пасхалка
app.component('btn-hellion', {
    props: {
        list: {
            type: Array,
            required: true
        }
    },
    data(){
        return{
            title: 'Хочу пошалить!',
            isHellion: Number(localStorage.getItem('hellion')),
            topNum: Math.random() * 700,
            leftNum: Math.random() * 400
        }        
    },
    template: `
    <div class='hellion-block' :style="{top: topNum + 'px', left: leftNum + 'px'}">
        <button @click="reverseNames"> {{ renameBtn }} </button>
    </div>
    `,
    computed: {
        renameBtn: function(){
            return this.title = this.isHellion ? "Хочу пошалить!" : "Верни все как былоооо!"
        }
    },
    methods: {
        reverseNames: function(){
            this.list.forEach((item, i) => {
                this.list[i].name = item.name.split('').reverse().join('');
            });
            listUpdate(this.list)
            
            this.isHellion = this.isHellion == true ? 0 : 1;
            hellionUpdate(this.isHellion)
            this.$emit('returnHellion', this.isHellion)

            this.topNum = Math.random() * 700;
            this.leftNum = Math.random() * 400;
        }        
    }
})

app.mount("#app")