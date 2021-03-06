import { shallow, ShallowWrapper } from 'enzyme';
import moment from 'moment';
import Moment from 'react-moment';
import { assoc, toString } from 'ramda';
import { Mock } from 'ts-mockery';
import { ExternalLink } from 'react-external-link';
import createShortUrlsRow from '../../../src/short-urls/helpers/ShortUrlsRow';
import Tag from '../../../src/tags/helpers/Tag';
import ColorGenerator from '../../../src/utils/services/ColorGenerator';
import { StateFlagTimeout } from '../../../src/utils/helpers/hooks';
import { ShortUrl } from '../../../src/short-urls/data';
import { ReachableServer } from '../../../src/servers/data';
import { CopyToClipboardIcon } from '../../../src/utils/CopyToClipboardIcon';

describe('<ShortUrlsRow />', () => {
  let wrapper: ShallowWrapper;
  const mockFunction = () => null;
  const ShortUrlsRowMenu = mockFunction;
  const stateFlagTimeout = jest.fn(() => true);
  const useStateFlagTimeout = jest.fn(() => [ false, stateFlagTimeout ]) as StateFlagTimeout;
  const colorGenerator = Mock.of<ColorGenerator>({
    getColorForKey: jest.fn(),
    setColorForKey: jest.fn(),
  });
  const server = Mock.of<ReachableServer>({
    url: 'https://doma.in',
  });
  const shortUrl: ShortUrl = {
    shortCode: 'abc123',
    shortUrl: 'http://doma.in/abc123',
    longUrl: 'http://foo.com/bar',
    dateCreated: moment('2018-05-23 18:30:41').format(),
    tags: [ 'nodejs', 'reactjs' ],
    visitsCount: 45,
    domain: null,
    meta: {
      validSince: null,
      validUntil: null,
      maxVisits: null,
    },
  };

  beforeEach(() => {
    const ShortUrlsRow = createShortUrlsRow(ShortUrlsRowMenu, colorGenerator, useStateFlagTimeout);

    wrapper = shallow(<ShortUrlsRow selectedServer={server} shortUrl={shortUrl} onTagClick={mockFunction} />);
  });
  afterEach(() => wrapper.unmount());

  it('renders date in first column', () => {
    const col = wrapper.find('td').first();
    const moment = col.find(Moment);

    expect(moment.html()).toContain('>2018-05-23 18:30</time>');
  });

  it('renders short URL in second row', () => {
    const col = wrapper.find('td').at(1);
    const link = col.find(ExternalLink);

    expect(link.prop('href')).toEqual(shortUrl.shortUrl);
  });

  it('renders long URL in third row', () => {
    const col = wrapper.find('td').at(2);
    const link = col.find(ExternalLink);

    expect(link.prop('href')).toEqual(shortUrl.longUrl);
  });

  describe('renders list of tags in fourth row', () => {
    it('with tags', () => {
      const col = wrapper.find('td').at(3);
      const tags = col.find(Tag);

      expect(tags).toHaveLength(shortUrl.tags.length);
      shortUrl.tags.forEach((tagValue, index) => {
        const tag = tags.at(index);

        expect(tag.prop('text')).toEqual(tagValue);
      });
    });

    it('without tags', () => {
      wrapper.setProps({ shortUrl: assoc('tags', [], shortUrl) });

      const col = wrapper.find('td').at(3);

      expect(col.text()).toContain('No tags');
    });
  });

  it('renders visits count in fifth row', () => {
    const col = wrapper.find('td').at(4);

    expect(col.html()).toContain(toString(shortUrl.visitsCount));
  });

  it('updates state when copied to clipboard', () => {
    const col = wrapper.find('td').at(1);
    const menu = col.find(CopyToClipboardIcon);

    expect(menu).toHaveLength(1);
    expect(stateFlagTimeout).not.toHaveBeenCalled();
    menu.simulate('copy');
    expect(stateFlagTimeout).toHaveBeenCalledTimes(1);
  });
});
