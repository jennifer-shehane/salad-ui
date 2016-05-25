import React from 'react'
import { get } from '../../../lib/fetch-methods'
import Preview, {mediaTypes} from '../preview/preview'
import Button from '../../util/button/button'
import Trans from '../../util/trans/trans'

export default class List extends React.Component {
  trans = DM_ENV['video/grid']
  currentPage = 1
  lastQuery = null
  videos = []
  hasMore = false

  state = {
    videos: [],
    failed: false,
    hasMore: false,
    loading: false,
    searching: false,
    err: null
  }

  static propTypes = {
    sortBy: React.PropTypes.string,
    limit: React.PropTypes.number,
    flags: React.PropTypes.array,
    endpoint: React.PropTypes.string,
    searchTerm: React.PropTypes.string,
    mediaType: React.PropTypes.oneOf(['video', 'playlist']),
  }

  static defaultProps = {
    sortBy: 'recent',
    limit: 3,
    flags: [],
    endpoint: '/videos',
    colSize: 3,
    searchTerm: null,
    mediaType: 'video'
  }

  componentDidMount(){
    this.loadVideos('setInitialVideos', this.props)
  }

  componentWillReceiveProps(nextProps){
    if(this.hasPropsChanged(this.props, nextProps)){
      this.currentPage = 1
      if(this.refs.container) this.refs.container.style.opacity = .4
      this.loadVideos('replaceVideos', nextProps)
    }
  }

  hasPropsChanged(oldProps, nextProps){
    return JSON.stringify({
      sortBy: oldProps.sortBy,
      limit: oldProps.limit,
      flags: (oldProps.flags||[]).join(','),
      endpoint: oldProps.endpoint,
      searchTerm: oldProps.searchTerm
    }) !== JSON.stringify({
      sortBy: nextProps.sortBy,
      limit: nextProps.limit,
      flags: (nextProps.flags||[]).join(','),
      endpoint: nextProps.endpoint,
      searchTerm: nextProps.searchTerm
    })
  }

  // Allow us to store the first set of videos to avoid hitting API after a search
  setInitialVideos(videos, hasMore){
    if(videos.length === 0 && this.props.ifEmpty) this.props.ifEmpty()
    this.videos = videos
    this.hasMore = hasMore
    this.replaceVideos(videos, hasMore)
  }

  loadVideos(cb, props){
    if(!this.props.mediaType) console.error('No mediaType provided to Grid.')
    this.setState({loading: true})
    let data = {
      fields: mediaTypes[this.props.mediaType].fields.join(','),
      page: this.currentPage,
      thumbnail_ratio: 'widescreen',
      sort: props.sortSelection || props.sortBy,
      limit: props.limit,
      localization: 'en_ZH' //must pass a non-existent language in order to have sort working in current API (lol)
    }
    let endpoint = props.endpoint ? props.endpoint : '/videos'
    if(props.searchTerm) data.search = props.searchTerm
    if(props.flags && props.flags.length) data.flags = props.flags.join(',')

    get(this.props.apiURL + endpoint, {data})
    .then(res => this[cb](res.list, res.has_more))
    .catch(err => {
      console.error('Failed to fetch videos', query, err)
      this.setState({failed: this.currentPage === 1, hasMore: false, searching: false, loading: false})
    })
  }

  appendVideos(videos, hasMore){
    this.setState({hasMore, videos: this.state.videos.concat(videos), failed: false, loading: false})
    this.refs.container.style.opacity = 1
    this.currentPage++
  }

  replaceVideos(videos, hasMore){
    this.setState({hasMore, videos, loading: false, failed: false})
    this.refs.container.style.opacity = 1
    this.currentPage++
  }

  loadMore(){
    if(typeof(DM_Events) !== 'undefined')
      DM_Events.trigger('channel_load_more', {ga: {label: this.props.id.charAt(0).toUpperCase() + this.props.id.substr(1)}})
    this.loadVideos('appendVideos', this.props)
  }

  renderVideos() {
    if(this.state.videos.length === 0){
      return (
        <div className="no-results"><Trans context={this.trans}>noVideosFound</Trans></div>
      )
    }
    return this.state.videos.map((video,index) =>
      <div key={'vid.'+index} style={{
          marginBottom: 20,
        }}>
        <Preview type="list" {...this.props} {...video}/>
      </div>
    )
  }

  onLoadError(){
    return (
      <div><h3 className="font-lg"><Trans context={this.trans}>loadErrorMsg</Trans></h3></div>
    )
  }

  render() {
    return (
      <div ref="container">
        {
          this.state.failed ?
          this.onLoadError():
          this.renderVideos()
        }
      </div>
    )
  }
}
