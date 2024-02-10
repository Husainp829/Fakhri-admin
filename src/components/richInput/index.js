import React from "react";
import {
  RichTextInput,
  RichTextInputToolbar,
  FormatButtons,
  ListButtons,
  LinkButtons,
  QuoteButtons,
  ClearButtons,
  ColorButtons,
} from "ra-input-rich-text";

export default ({ size, ...props }) => (
  <RichTextInput
    toolbar={(
      <RichTextInputToolbar>
        <FormatButtons size={size} />
        <ListButtons size={size} />
        <LinkButtons size={size} />
        <QuoteButtons size={size} />
        <ClearButtons size={size} />
        <ColorButtons size={size} />
      </RichTextInputToolbar>
    )}
    {...props}
  />
);
