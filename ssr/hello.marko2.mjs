// Compiled using marko@5.34.1 - DO NOT EDIT
import { t as _t } from "marko/src/runtime/html/index.js";
const _marko_componentType = "hello.marko",
  _marko_template = _t(_marko_componentType);
//_marko_template.path = __filename;
export default _marko_template;
import { x as _marko_escapeXml } from "marko/src/runtime/html/helpers/escape-xml.js";
//import _initComponents from "marko/src/core-tags/components/init-components-tag.js";
//import _marko_tag from "marko/src/runtime/helpers/render-tag.js";
//import _awaitReorderer from "marko/src/core-tags/core/await/reorderer-renderer.js";
//import _preferredScriptLocation from "marko/src/core-tags/components/preferred-script-location-tag.js";
import _marko_renderer from "marko/src/runtime/components/renderer.js";
const _marko_component = {};
_marko_template._ = _marko_renderer(function (input, out, _componentDef, _component, state, $global) {
  out.w("<!DOCTYPE html>");
  out.w("<html lang=en>");
  out.w("<body>");
  out.w("<table>");
  {
//    let _keyValue = 0;
    for (const entry of input || []) {
//      const _keyScope = `[${_keyValue++}]`;
      out.w("<tr>");
      out.w("<td>");
      out.w(_marko_escapeXml(entry.id));
      out.w("</td>");
      out.w("<td>");
      out.w(_marko_escapeXml(entry.name));
      out.w("</td>");
      out.w("</tr>");
    }
  }
  out.w("</table>");
//  _marko_tag(_initComponents, {}, out, _componentDef, "6");
//  _marko_tag(_awaitReorderer, {}, out, _componentDef, "7");
//  _marko_tag(_preferredScriptLocation, {}, out, _componentDef, "8");
  out.w("</body>");
  out.w("</html>");
}, {
  t: _marko_componentType,
  i: true,
  d: true
}, _marko_component);
_marko_template.meta = {
  id: _marko_componentType
};
