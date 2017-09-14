module Elem exposing (cmdBtn, mainTitle, stylesheet, textCopy)

import Html exposing (Attribute, Html, div, h1, img, node, p, text)
import Html.Attributes exposing (class, href, rel, src, tabindex)
import Tachyons exposing (classes)
import Tachyons.Classes as Tac


cmdBtn : String -> List (Attribute msg) -> Html msg
cmdBtn imgSrc attrs =
    div (tabindex 1 :: class "cmd-btn" :: attrs)
        [ img
            [ src imgSrc ]
            []
        ]


stylesheet : String -> Html msg
stylesheet url =
    node "link"
        [ rel "stylesheet"
        , href url
        ]
        []


mainTitle : String -> Html msg
mainTitle title =
    let
        h1Classes =
            [ Tac.mt0
            , Tac.f3
            , Tac.f2_m
            , Tac.f1_l
            , Tac.fw1
            , Tac.baskerville
            ]
    in
    h1 [ classes h1Classes ]
        [ text title ]


textCopy : String -> Html msg
textCopy copy =
    let
        pClasses =
            [ Tac.lh_copy
            , Tac.helvetica
            ]
    in
    p [ classes pClasses ]
        [ text copy ]
