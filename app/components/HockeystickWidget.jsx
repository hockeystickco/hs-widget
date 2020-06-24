import React from 'react';
import { Card, Skeleton, Tag, Button, Typography, Space } from 'antd';

const { Text } = Typography;

import './hockeystick-widget.less';
import './hockeystick-widget.css'

import PlaceholderLogo from './images/Placeholder_Logo.png';
import en from './data/en.json';

export default class HockeystickWidget extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      visible: false,
      facts: {"Verticals": []},
      coordinates: [0, 0]
    };
  }

  componentDidMount() {
  }

  handleClick = (e) => {
    this.setState({
      'visible': !this.state.visible
    });
    if (!this.state.loaded) {
      this.fetchCompanyInfo('NinetalesCharmanderFront-line.com')
        .then(
          (result) => {
            this.setState({
              loading: false,
              facts: result
            });
            // console.log(this.state.facts);
          },
          (error) => {
            console.log(error);
          }
        );
    }
  }


  render() {
    const logo = <img
      className='logo'
      src={'https://i.imgur.com/h8P0NNv.png'}/>;

    // TODO: Generalize this
    const entityName = (this.state.facts["Operating Name"] || this.state.facts["Legal Name"]) ?
    (<Text
      className="entityName">
      {this.state.facts["Operating Name"] || this.state.facts["Legal Name"]}
    </Text>) : null;

    const entityType = (this.state.facts["Organization Type"]) ?
    (<Text
      className="entityType">
      {this.state.facts["Organization Type"]}
    </Text>) : null;

    const entityLocation = (this.state.facts["Location"]) ?
    (<Text
      className="entityLocation">
      {this.normalizeLocation(this.state.facts["Location"])}
    </Text>) : null;

    // TODO: Handle vertical overflow
    const entityVerticals = (this.state.facts["Verticals"].length > 0) ?
    (<Text
      className="verticalList">
      {this.state.facts["Verticals"].map(vertical => <Tag key={vertical} className="vertical">{vertical}</Tag>)}
      {/*["TravelTech", "Vertical2"].map(vertical => <Tag className="vertical">{vertical}</Tag>)*/}
    </Text>) : null;

    const entityDesc = (this.state.facts["Short Description"]) ?
    (<Text
      className="entityDesc">
      {this.state.facts["Short Description"]}
    </Text>) : null;

    const hsButton = <Button type="primary" className="hsButton">View Hockeystick Profile</Button>;

    const powered = <img
      className='powered'
      src={'https://i.imgur.com/YUKlZj0.png'}/>;

    console.log(this.state.facts);
    return (
      <Text
        className='trigger'
        onClick={this.handleClick}
        id='antd'
        >Click me
        <Card className={this.state.visible ? 'card' : 'hidden'}>
          <Skeleton loading={this.state.loading} active={true} avatar={{size: 106, shape: 'square'}} paragraph={false} title={false}>
            <Space direction='vertical' align='center'>
              {logo}
              {entityName}
              {entityType}
              {entityLocation}
              {entityVerticals}
              {entityDesc}
              {hsButton}
            </Space>
          </Skeleton>
          <Skeleton style={{'margin': '10px'}} loading={this.state.loading} active={true} paragraph={false} title={{width: 150}}/>
          <Skeleton loading={this.state.loading} active={true} paragraph={false} title={{width: 192}}/>
          <br/>
          <Skeleton loading={this.state.loading} active={true} paragraph={false} title={{width: 240}}/>
          <Skeleton loading={this.state.loading} active={true} paragraph={false} title={{width: 240}}/>
          <Skeleton loading={this.state.loading} active={true} paragraph={false} title={{width: 240}}/>
          <Skeleton loading={this.state.loading} active={true} paragraph={false} title={{width: 240}}/>
          <br/>
          <Skeleton loading={this.state.loading} active={true} paragraph={false} title={{width: 240}}/>
          {powered}
        </Card>
      </Text>
    );
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
    let response = await this.fetchData(query, 'https://graph.dev2.hkst.io/');
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
        facts[name] = (name == "Organization Type") ? (option && option.name) : value;
      }
    });

    let headquarters = this.getHeadquarters(officeArray);

    // If headquarters is found,
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
        'Referer': url,
      },
      body: JSON.stringify({query})
    })
      .then(r => r.json());
    return response;
  }


  // Takes an array of structures representing offices, and returns one with
  // "OfficeType::Headquarter" as its value for "Office Type", if one exists.
  getHeadquarters(offices) {
    let headquarters = null;
    offices.forEach(office => {
      const {"facts": officeFacts} = office;
      officeFacts.forEach(officeFact => {
        const {"concept": {"name": name}, "value": value} = officeFact;
        if (name == "Office Type" && value == "OfficeType::Headquarter") {
          headquarters = office;
        }
      });
    });
    return headquarters;
  }

  normalizeLocation(uniqueKey) {
    const tokens = uniqueKey.split('::');
    var location = en[uniqueKey];
    while (tokens.length > 2) {
      tokens.pop();
      location += ", " + en[tokens.join('::')];
    }
    return location;
  }
}
