import React from 'react';
import { Card, Skeleton, Tag, Button, Typography, Space, Popover } from 'antd';
import onClickOutside from "react-onclickoutside";

const { Text } = Typography;

import './styles/hockeystick-widget.less';
import './styles/hockeystick-widget.css';

import en from './data/en.json';
import WidgetSkeleton from './WidgetSkeleton.jsx';
import Logo from './Logo.jsx';
import EntityInfo from './EntityInfo.jsx';
import Error from './Error.jsx';
import HSButton from './HSButton.jsx';
import VerticalList from './VerticalList.jsx';

class HockeystickWidget extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      visible: false,
      error: false,
      facts: {"Verticals": []},
    };
  }

  handleClick = (e) => {
    console.log ('handleClick');
    this.setState({
      'visible': !this.state.visible
    });
    if (this.state.loading) {
      this.fetchCompanyInfo(this.props.wpObject.atts.url)
        .then(
          (result) => {
            this.setState({
              loading: false,
              facts: result
            });
          },
          (error) => {
            console.log(error);
            this.setState({
              error: true
            });
          }
        );
    }
  }

  handleClickOutside = (e) => {
    console.log('handleClickOutside');
    this.setState({
      visible: false
    });
   };

  render() {
    const noVerticals = ["Government", "Investor", "Accelerator / Incubator"];

    // This can probably be made better; not sure what the best way is.
    // TODO: ^^^
    const entityVerticals = (this.state.facts["Verticals"].length > 0 && !(noVerticals.includes(this.normalizeType(this.state.facts["Organization Type"])))) ?
    (<Space
      size={0}
      direction="vertical">
      <Space
        className="verticalList"
        size={3}>
        {this.state.facts["Verticals"].slice(0, 3).map(vertical => <Tag key={vertical} className="vertical">{vertical}</Tag>)}
      </Space>
      <Space
        className="verticalList"
        size={3}>
        {this.state.facts["Verticals"].slice(3, 6).map(vertical => <Tag key={vertical} className="vertical">{vertical}</Tag>)}
      </Space>
    </Space>) : null;

    const card = (
      <Card
        className='popup'>
        <Error visible={this.state.error} imageSrc={this.props.wpObject.images + '/Warning.png'}/>
        <WidgetSkeleton loading={this.state.loading && !(this.state.error)}/>
        <Space direction='vertical' align='center' size={0}>
          <Logo
            src={'http://logo.hockeystick.co/' + this.props.wpObject.atts.url + '?size=' + 106}
            placeholder={this.props.wpObject.images + '/Placeholder_Logo.png'}
            visible={this.state.loading || this.state.error ? 0 : 1}/>
          <EntityInfo className='entityName' content={this.state.facts["Operating Name"] || this.state.facts["Legal Name"]}/>
          <EntityInfo className='entityType' content={this.normalizeType(this.state.facts["Organization Type"])}/>
          <EntityInfo className='entityLocation' content={this.normalizeLocation(this.state.facts["Location"])}/>
          <VerticalList
            visible={this.state.facts['Verticals'].length && !noVerticals.includes(this.normalizeType(this.state.facts["Organization Type"])) ? 1 : 0}
            verticals={this.state.facts['Verticals']}/>
          <EntityInfo className='entityDesc' content={this.state.facts["Short Description"]}/>
          <HSButton
            className='hsButton'
            href={`https://www.hockeystick.co/entities/${this.state.facts['id']}`}
            visible={this.state.loading || this.state.error ? 0 : 1}/>
        </Space>
        <img
          className={this.state.error ? 'hidden' : 'powered'}
          src={this.props.wpObject.images + '/Powered_By_HS.png'}
          style={{'marginTop': '20px'}}/>
      </Card>
    );
    console.log(this.state);

    return (
      <>
        <Popover
          overlayClassName='no-padding'
          content={card}
          placement='bottom'
          visible={!this.state.visible}
        >
          <Text className='trigger' onClick={this.handleClick}>{this.props.wpObject.content}</Text>
        </Popover>
      </>
    );


    // return (
    //   <>
    //     <Text
    //       className='trigger'
    //       onClick={this.handleClick}
    //       id='antd'
    //       >{this.props.content}
    //       <Card className={this.state.visible ? 'card' : 'hidden'} onClick={(e) => {e.stopPropagation()}}>
    //         <WidgetSkeleton loading={this.state.loading && !(this.state.error)}/>
    //         {error}
    //         <Space className={(this.state.loading || this.state.error) ? 'hidden' : ''} direction='vertical' align='center' size={0}>
    //           <Logo
    //             src={'http://logo.hockeystick.co/' + domain + '?size=' + 106}
    //             placeholder={this.props.wpObject.images + '/Placeholder_Logo.png'}/>
    //           {entityName}
    //           {entityType}
    //           {entityLocation}
    //           {entityVerticals}
    //           {entityDesc}
    //           {hsButton}
    //         </Space>
    //         {powered}
    //       </Card>
    //     </Text>
    //     <div className={this.state.visible ? 'background' : 'hidden'}></div>
    //   </>
    // );
  }

  async fetchCompanyInfo(domain) {
    let facts = {"Verticals": []};
    const query = `
      query SearchQuery {
        view(datasets: ["public"]) {
          search(type: ENTITY, page: 1, pageSize: 10, sortOrder: null, first: 1, conceptFilters: [{string: {like: "` + domain + `"}, uniqueKey: "Entity::Domain"}]) {
            count
            edges {
              node {
                ... on Entity {
                  id
                  facts {
                    value
                    concept {
                      name
                    }
                    option {
                      name
                    }
                  }
                  offices {
                    id
                    facts {
                      concept {
                        name
                      }
                      value
                      option {
                        name
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;
    let response = await this.fetchData(query, 'https://graph.rc.hkst.io/');
    let {
      "data":{
        "view":{
          "search":{
            "edges":[
              {
                "node":{
                  "facts":factArray,
                  "id": id,
                  "offices":officeArray
                }
              }
            ]
          }
        }
      }
    } = response;

    facts["id"] = id;

    factArray.forEach((fact) => {
      const {
        "concept": {"name": name},
        "option": option,
        "value": value
      } = fact;
      if (name == "Vertical") {
        facts["Verticals"].push((option && option.name) || value);
      } else {
        facts[name] = value;
      }
    });

    let headquarters = this.getHeadquarters(officeArray);

    // Ignore non-headquarter offices
    const officeFacts = (headquarters && headquarters["facts"]) || [];
    officeFacts.forEach(officeFact => {
      const {"concept": {"name": name}, "value": value} = officeFact;
      facts[name] = value;
    });
    return facts;
  }

  fetchData(query, url) {
    let response = fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({query}),
      referrerPolicy: "origin"
    })
      .then(r => r.json());
    return response;
  }


  // Takes an array of structures representing offices, and returns one with
  // "OfficeType::Headquarter" as its value for "Office Type", if one exists.
  getHeadquarters(offices) {
    if (!offices) {
      return null;
    }
    return offices.find(
      office => {
        if (!office.facts) {
          return false;
        }
        return office.facts.find(
          fact => {
            return fact.concept && fact.concept.name && fact.value && fact.concept.name == 'Office Type' && fact.value == 'OfficeType::Headquarter';
          }
        );
      }
    ) || null;
  }

  normalizeLocation(uniqueKey) {
    if (!uniqueKey) {
      return null;
    }
    const tokens = uniqueKey.split('::');
    let location = en[uniqueKey];
    while (tokens.length > 2) {
      tokens.pop();
      location += ", " + en[tokens.join('::')];
    }
    return location;
  }

  normalizeType(uniqueKey) {
    if (!uniqueKey) {
      return null;
    }
    return en[uniqueKey.match(/^[^:]+::[^:]+/)] || null;
  }
}

export default (HockeystickWidget);
