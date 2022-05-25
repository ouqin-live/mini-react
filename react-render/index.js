const jsx = <ul className="list">
    <li className="item" style={{ background: 'blue', color: 'pink' }} onClick={() => alert(2)}>aaa</li>
    <li className="item">bbbb</li>
    <li className="item">cccc</li>
</ul>

render(jsx, document.getElementById('root'));