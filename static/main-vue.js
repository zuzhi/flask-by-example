var app = new Vue({
  delimiters: ['${', '}'],
  el: '#app',
  data: {
    url: '',
    submitButtonText: 'Submit',
    loading: false,
    urlerror: false,
    wordcounts: {},
    history: []
  },
  methods: {
    getWordCount: function (jobID) {
      var self = this
      var poller = function () {
        self.$http.get('/results/' + jobID).then(response => {
          if (response.status === 202) {
            console.log(response.body)
          } else if (response.status === 200) {
            console.log(response.body)
            self.loading = false
            self.urlerror = false
            self.wordcounts = response.body
          }
        }, response => {
          // error callback
          console.log(response)
          self.loading = false
          self.urlerror = true
        })
      }
      poller()
      var timer = setInterval(function () {
        if (self.loading === false) {
          clearInterval(timer)
          return
        }
        poller()
      }, 2000)
    },
    getResults: function () {
      console.log('test')
      this.$http.post('start', {
        'url': this.url
      }).then((response) => {
        console.log('done')
        // success callback
        console.log(response.body)
        // save history
        var item  = {}
        item.createTime = Date.now()
        item.url = this.url
        item.jobID = response.body
        this.history.push(item)
        this.getWordCount(response.body)
        this.loading = true
        this.urlerror = false
      }, (response) => {
        // error callback
      })
    },
    dismiss: function () {
      this.urlerror = false
    },
    refreshChart: function () {
      console.log(this.newOption)
      // 使用指定的配置项和数据显示图表
      myChart.setOption(this.newOption)
    },
    resume: function (jobID) {
      this.$http.get('/results/' + jobID).then(response => {
        if (response.status === 202) {
          console.log(response.body)
        } else if (response.status === 200) {
          console.log(response.body)
          this.loading = false
          this.urlerror = false
          this.wordcounts = response.body
        }
      }, response => {
        // error callback
        console.log(response)
        this.loading = false
        this.urlerror = true
      })
    }
  },
  computed: {
    // 指定图表的配置项和数据
    newOption: function () {
      return {
        tooltip: {},
        xAxis: {
          type: 'value',
          splitLine: {
            show: false
          }
        },
        yAxis: {
          type: 'category',
          data: this.wordcounts ? Object.keys(this.wordcounts) : [],
          axisTick: {
            show: false
          }
        },
        series: [{
          name: 'count',
          type: 'bar',
          data: this.wordcounts ? Object.values(this.wordcounts) : []
        }]
      }
    },
    chartHeight: function () {
      return (36 * Object.keys(this.wordcounts).length) + 'px';
    }
  },
  watch: {
    wordcounts: function () {
      console.log('watch')
      this.refreshChart()
    }
  },
  mounted: function () {
    console.log('mounted')
  }
})


// 基于准备好的dom，初始化echarts实例
var myChart = echarts.init(document.getElementById('main'))

// 调整大小
window.onresize = function () {
  myChart.resize()
}
